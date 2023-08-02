import {
  AudioPlayerStatus,
  PlayerSubscription,
  VoiceConnectionStatus,
  createAudioResource,
} from "@discordjs/voice";
import { ButtonStyle, CommandInteraction, ComponentType } from "discord.js";
import { stream } from "play-dl";
import { Bot } from "interfaces/discordjs.js";
import { getNextSongInQueue, getPrevSongInQueue } from "./queue.js";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";

export const play = async (
  interaction: CommandInteraction,
  newSubscription: PlayerSubscription,
  bot: Bot,
  songUrl: string,
  songName: string
): Promise<void> => {
  let title = songName,
    url = songUrl,
    subscription = newSubscription;
  let strm = await stream(songUrl, { quality: 2 });
  let resource = createAudioResource(strm.stream, { inputType: strm.type });
  const player = newSubscription.player;
  const connection = newSubscription.connection;
  player.play(resource);

  player.on(AudioPlayerStatus.Idle, async () => {
    const nextSong = getNextSongInQueue(interaction.guild!.id);

    if (nextSong) {
      if (!bot.subscriptions.has(interaction.guild!.id)) {
        subscription = connection.subscribe(player)!;
        bot.subscriptions.set(interaction.guild!.id, subscription);
      }
      title = nextSong.title;
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

  const prev = new ButtonBuilder()
    .setCustomId("prev")
    .setLabel("⏮️")
    .setStyle(ButtonStyle.Primary);

  const next = new ButtonBuilder()
    .setCustomId("next")
    .setLabel("⏭️")
    .setStyle(ButtonStyle.Primary);
  const pause = new ButtonBuilder()
    .setCustomId("pause")
    .setLabel("⏸️")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    prev,
    pause,
    next
  );

  const response = await interaction.editReply({
    content: songName,
    components: [row],
  });

  // const collectorFilter = (i) => i.user.id === interaction.user.id;

  try {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });
    collector.on("collect", async (confirmation) => {
      if (confirmation.customId === "prev") {
        const prevSong = getPrevSongInQueue(interaction.guild!.id);
        if (prevSong) {
          title = prevSong.title;
          url = prevSong.url;
          strm = await stream(url, { quality: 2 });
          resource = createAudioResource(strm.stream, { inputType: strm.type });
          subscription.player.play(resource);
        }
        await confirmation.update({
          content: title,
          components: [row],
        });
      } else if (confirmation.customId === "next") {
        const nextSong = getNextSongInQueue(interaction.guild!.id);
        if (nextSong) {
          title = nextSong.title;
          url = nextSong.url;
          strm = await stream(url, { quality: 2 });
          resource = createAudioResource(strm.stream, { inputType: strm.type });
          subscription.player.play(resource);
        }
        await confirmation.update({
          content: title,
          components: [row],
        });
      } else if (confirmation.customId === "pause") {
        if (subscription.player.state.status === AudioPlayerStatus.Paused)
          subscription.player.unpause();
        else subscription.player.pause();

        await confirmation.update({
          content: title,
          components: [row],
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
