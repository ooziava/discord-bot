import { GuildMember, Interaction } from "discord.js";
import { AudioPlayerStatus, getVoiceConnection } from "@discordjs/voice";

import { type Bot } from "interfaces/discordjs";
import {
  removeSongFromQueue,
  setCurrentSong,
  shuffleQueue,
} from "../services/queue.js";
import { play } from "../services/play.js";
import { playPrev } from "../services/playPrev.js";
import { playNext } from "../services/playNext.js";
import { createPlayerEmbed } from "./embedBuilder.js";
import { playerOptionsRow, playerRow } from "./actionBuilder.js";

export default async (interaction: Interaction, bot: Bot): Promise<void> => {
  if (interaction.isCommand()) {
    const command = bot.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction, bot);
    } catch (error) {
      console.error(error);

      console.error(error);

      if (interaction) {
        const reply =
          interaction.replied || interaction.deferred === true
            ? interaction.followUp
            : interaction.reply;
        try {
          await reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          interaction.channel?.send(
            "There was an error while executing this command!"
          );
        }
      } else {
        console.error(
          "Interaction object is undefined or does not have a reply or followUp method."
        );
      }
    }
  } else if (interaction.isButton()) {
    // Check if the current message ID matches the last interaction message ID
    const id = bot.activeMessageIds.get(interaction.guild!.id);
    const inter = bot.interactions.get(interaction.guild!.id);
    if (!inter) return;
    if (id && id !== interaction.message?.id) return;

    const subscription = bot.subscriptions.get(interaction.guild!.id);
    if (subscription) {
      if (
        (interaction.member as GuildMember)?.voice.channel?.id !==
        subscription.connection.joinConfig.channelId
      ) {
        await interaction.reply({
          content: "You must be in the same voice channel as the bot!",
          ephemeral: true,
        });
        return;
      }
    }

    const song = bot.currentSong.get(interaction.guild!.id)!;
    if (interaction.customId === "prev") {
      const res = await playPrev(interaction.guild!.id, bot);
      if (!res) play(interaction.guild!.id, bot);
      interaction.deferUpdate();
    } else if (interaction.customId === "next") {
      const res = await playNext(interaction.guild!.id, bot);
      if (!res) play(interaction.guild!.id, bot);
      interaction.deferUpdate();
    } else if (interaction.customId === "pause") {
      if (subscription) {
        if (subscription.player.state.status === AudioPlayerStatus.Paused) {
          subscription.player.unpause();
        } else {
          subscription.player.pause();
        }
        if (inter)
          await inter.editReply({
            content: " ",
            components: [
              playerRow(
                subscription.player.state.status === AudioPlayerStatus.Paused
              ),
            ],
            embeds: [createPlayerEmbed(interaction, song)],
          });
      }
      interaction.deferUpdate();
    } else if (interaction.customId === "options") {
      const attributes = bot.songAttributes.get(interaction.guild!.id);
      const optionsVisible =
        attributes?.optionsVisible === undefined
          ? true
          : !attributes?.optionsVisible;
      bot.songAttributes.set(interaction.guild!.id, {
        ...attributes,
        optionsVisible,
      });

      if (inter) {
        await inter.editReply({
          content: " ",
          components: optionsVisible
            ? [
                playerRow(),
                playerOptionsRow(
                  bot.songAttributes.get(interaction.guild!.id)?.isLooping ||
                    false
                ),
              ]
            : [playerRow()],
          embeds: [createPlayerEmbed(interaction, song)],
        });
      }
      await interaction.deferUpdate();
    } else if (interaction.customId === "shuffle") {
      const currSong = shuffleQueue(interaction.guild!.id);
      await inter.editReply({
        content: " ",
        components: [playerRow()],
        embeds: [createPlayerEmbed(interaction, currSong)],
      });
      await interaction.deferUpdate();
    } else if (interaction.customId === "loop") {
      bot.songAttributes.set(interaction.guild!.id, {
        ...bot.songAttributes.get(interaction.guild!.id),
        isLooping: !bot.songAttributes.get(interaction.guild!.id)?.isLooping,
      });
      await inter.editReply({
        content: " ",
        components: [
          playerRow(),
          playerOptionsRow(
            bot.songAttributes.get(interaction.guild!.id)?.isLooping || false
          ),
        ],
        embeds: [createPlayerEmbed(interaction, song)],
      });
      await interaction.deferUpdate();
    } else if (interaction.customId === "remove") {
      const index = bot.currentSong.get(interaction.guild!.id)?.index;
      if (index === undefined) return;
      const result = removeSongFromQueue(interaction.guild!.id, index);
      if (result) {
        setCurrentSong(interaction.guild!.id, index - 1);
        const res = await playNext(interaction.guild!.id, bot);
        if (!res) play(interaction.guild!.id, bot);
      } else {
        await inter.editReply("Failed to remove song from queue!");
      }
      await interaction.deferUpdate();
    } else if (interaction.customId === "stop") {
      if (subscription) {
        subscription.player.stop();
        bot.subscriptions.delete(interaction.guild!.id);
      }
      getVoiceConnection(interaction.guild!.id)?.destroy();
      bot.currentSong.delete(interaction.guild!.id);
      bot.songAttributes.delete(interaction.guild!.id);
      bot.interactions.delete(interaction.guild!.id);

      await inter.editReply({
        content: "Stopped playing!",
        components: [],
        embeds: [],
      });
    }
    if (
      !(interaction.customId === "options" || interaction.customId === "loop")
    )
      bot.songAttributes.set(interaction.guild!.id, {
        ...bot.songAttributes.get(interaction.guild!.id),
        optionsVisible: false,
      });
  } else if (interaction.isStringSelectMenu()) {
    // respond to the select menu
  }
};
