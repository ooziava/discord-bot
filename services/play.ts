import {
  AudioPlayerStatus,
  VoiceConnectionStatus,
  createAudioResource,
} from "@discordjs/voice";
import { CommandInteraction, ComponentType } from "discord.js";
import { stream } from "play-dl";
import { Bot, Song } from "interfaces/discordjs";
import { getNextSongInQueue, getPrevSongInQueue } from "./queue.js";
import { createPlayerEmbed } from "../utils/embedBuilder.js";
import { playerRow } from "../utils/actionBuilder.js";

export const play = async (
  interaction: CommandInteraction,
  bot: Bot,
  newSong: Song
): Promise<void> => {
  let url = newSong.url;
  let subscription = bot.subscriptions.get(interaction.guild!.id)!;
  let strm = await stream(url, { quality: 2 });
  let resource = createAudioResource(strm.stream, { inputType: strm.type });
  let song = newSong;

  const player = subscription.player;
  const connection = subscription.connection;
  player.play(resource);

  player.on(AudioPlayerStatus.Idle, async () => {
    const nextSong = getNextSongInQueue(interaction.guild!.id);

    if (nextSong) {
      url = nextSong.url;
      strm = await stream(url, { quality: 2 });
      resource = createAudioResource(strm.stream, { inputType: strm.type });
      player.play(resource);
    } else {
      await interaction.editReply("Queue is empty!");
      player.stop();
      subscription.unsubscribe();
      bot.subscriptions.delete(interaction.guild!.id);
    }
  });

  subscription.player.on("error", () => {
    interaction.editReply("Error playing song!");
    subscription.player.stop();
  });

  const row = playerRow();
  const response = await interaction.editReply({
    content: " ",
    components: [row],
    embeds: [createPlayerEmbed(interaction, song, song.index!)],
  });

  try {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });
    collector.on("collect", async (confirmation) => {
      if (confirmation.customId === "prev") {
        const prevSong = getPrevSongInQueue(interaction.guild!.id);

        if (prevSong) {
          song = prevSong;
          if (!bot.subscriptions.has(interaction.guild!.id)) {
            subscription = connection.subscribe(player)!;
            bot.subscriptions.set(interaction.guild!.id, subscription);
          }
          url = song.url;
          strm = await stream(url, { quality: 2 });
          resource = createAudioResource(strm.stream, { inputType: strm.type });
          subscription.player.play(resource);
          await confirmation.update({
            content: " ",
            components: [row],
            embeds: [createPlayerEmbed(interaction, song, song.index!)],
          });
        }
      } else if (confirmation.customId === "next") {
        const nextSong = getNextSongInQueue(interaction.guild!.id);

        if (nextSong) {
          song = nextSong;
          if (!bot.subscriptions.has(interaction.guild!.id)) {
            subscription = connection.subscribe(player)!;
            bot.subscriptions.set(interaction.guild!.id, subscription);
          }
          url = song.url;
          strm = await stream(url, { quality: 2 });
          resource = createAudioResource(strm.stream, { inputType: strm.type });
          subscription.player.play(resource);

          await confirmation.update({
            content: " ",
            components: [row],
            embeds: [createPlayerEmbed(interaction, song, song.index!)],
          });
        }
      } else if (confirmation.customId === "pause") {
        if (subscription.player.state.status === AudioPlayerStatus.Paused)
          subscription.player.unpause();
        else subscription.player.pause();

        await confirmation.update({
          content: " ",
          components: [row],
          embeds: [createPlayerEmbed(interaction, song, song.index!)],
        });
      }
    });

    collector.on(VoiceConnectionStatus.Disconnected, async () => {
      collector.stop();
      await interaction.editReply("Disconnected!");
      player.stop();
      subscription.unsubscribe();
      bot.subscriptions.delete(interaction.guild!.id);
    });
  } catch (e) {}
};
