import {
  CommandInteraction,
  InteractionResponse,
  ButtonInteraction,
  ComponentType,
  Message,
} from "discord.js";
import {
  AudioPlayerStatus,
  VoiceConnectionStatus,
  createAudioResource,
} from "@discordjs/voice";
import { stream } from "play-dl";

import { Bot, Song } from "interfaces/discordjs.js";
import {
  getNextSongInQueue,
  getPrevSongInQueue,
  shuffleQueue,
} from "../services/queue.js";
import { userFilter } from "./collectorFilters.js";
import { createPlayerEmbed } from "./embedBuilder.js";
import { playerRow } from "./actionBuilder.js";

type ConfirmCallback = (confirmation: ButtonInteraction) => Promise<void>;

const createConfirmarion = async (
  interaction: CommandInteraction,
  response: InteractionResponse<boolean>,
  confirm: ConfirmCallback
): Promise<void> => {
  try {
    const confirmation = await response.awaitMessageComponent({
      filter: userFilter(interaction),
      time: 60000,
    });
    if (confirmation.customId === "confirm") {
      await confirm(confirmation as ButtonInteraction);
    } else if (confirmation.customId === "cancel") {
      await confirmation.update({
        content: "Action cancelled",
        components: [],
      });
    }
  } catch (e) {
    await interaction.editReply({
      content: "Confirmation not received within 1 minute, cancelling",
      components: [],
    });
  }
};

const createPagination = async (
  interaction: CommandInteraction,
  response: InteractionResponse<boolean>,
  next: ConfirmCallback,
  prev: ConfirmCallback
): Promise<void> => {
  try {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000,
    });
    collector.on("collect", async (confirmation) => {
      if (confirmation.customId === "prev") {
        await prev(confirmation);
      } else if (confirmation.customId === "next") {
        await next(confirmation);
      }
    });
  } catch (e) {
    await interaction.editReply({
      content: "Something went wrong!",
      components: [],
    });
  }
};

const createPlayer = async (
  interaction: CommandInteraction,
  response: Message<boolean>,
  bot: Bot,
  song: Song
): Promise<void> => {
  let strm = await stream(song.url, { quality: 2 });
  let resource = createAudioResource(strm.stream, { inputType: strm.type });
  let subscription = bot.subscriptions.get(interaction.guild!.id)!;

  const player = subscription.player;
  const connection = subscription.connection;
  const timastamp = Date.now();
  player.play(resource);

  try {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (confirmation) => {
      if (confirmation.customId === "prev") {
        const prevSong = getPrevSongInQueue(interaction.guild!.id);

        song = prevSong || song;
        if (!bot.subscriptions.has(interaction.guild!.id)) {
          subscription = connection.subscribe(player)!;
          bot.subscriptions.set(interaction.guild!.id, subscription);
        }
        strm = await stream(song.url, { quality: 2 });
        resource = createAudioResource(strm.stream, { inputType: strm.type });
        subscription.player.play(resource);
        await confirmation.update({
          content: " ",
          components: [playerRow()],
          embeds: [createPlayerEmbed(interaction, song, timastamp)],
        });
      } else if (confirmation.customId === "next") {
        const nextSong = getNextSongInQueue(interaction.guild!.id);

        song = nextSong || song;
        if (!bot.subscriptions.has(interaction.guild!.id)) {
          subscription = connection.subscribe(player)!;
          bot.subscriptions.set(interaction.guild!.id, subscription);
        }
        strm = await stream(song.url, { quality: 2 });
        resource = createAudioResource(strm.stream, { inputType: strm.type });
        subscription.player.play(resource);

        await confirmation.update({
          content: " ",
          components: [playerRow()],
          embeds: [createPlayerEmbed(interaction, song, timastamp)],
        });
      } else if (confirmation.customId === "pause") {
        const paused =
          subscription.player.state.status === AudioPlayerStatus.Paused;
        if (paused) subscription.player.unpause();
        else subscription.player.pause();

        await confirmation.update({
          content: " ",
          components: [playerRow(!paused)],
          embeds: [createPlayerEmbed(interaction, song, timastamp)],
        });
      } else if (confirmation.customId === "shuffle") {
        shuffleQueue(interaction.guild!.id);
        song = getPrevSongInQueue(interaction.guild!.id) || song;

        await confirmation.update({
          content: " ",
          components: [playerRow()],
          embeds: [createPlayerEmbed(interaction, song, timastamp)],
        });
      } else {
        await confirmation.update({
          content: " ",
          components: [playerRow()],
          embeds: [createPlayerEmbed(interaction, song, timastamp)],
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
export { createConfirmarion, createPagination, createPlayer };
