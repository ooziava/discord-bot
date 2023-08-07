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

      const reply =
        interaction?.replied || interaction?.deferred === true
          ? interaction?.followUp
          : interaction?.reply;

      if (reply) {
        try {
          await reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          interaction?.channel?.send(
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
    const id = bot.activeMessageIds.get(interaction.guild!.id);
    const inter = bot.interactions.get(interaction.guild!.id);
    if (!inter) return;
    if (id && id !== interaction.message?.id) return;

    const { subscriptions, currentSong, songAttributes } = bot;
    const subscription = subscriptions.get(interaction.guild!.id);
    const song = currentSong.get(interaction.guild!.id)!;
    const attributes = songAttributes.get(interaction.guild!.id);

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

    switch (interaction.customId) {
      case "prev":
        let resPrev,
          countPrev = 0;
        do {
          resPrev = await playPrev(interaction.guild!.id, bot);
          countPrev++;
        } while (!resPrev && countPrev < 10);
        // if (!resPrev) play(interaction.guild!.id, bot);
        break;
      case "next":
        let resNext,
          countNext = 0;
        do {
          resNext = await playNext(interaction.guild!.id, bot);
          countNext++;
        } while (!resNext && countNext < 10);
        // if (!resNext) play(interaction.guild!.id, bot);
        break;
      case "pause":
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
        break;
      case "options":
        const optionsVisible =
          attributes?.optionsVisible === undefined
            ? true
            : !attributes?.optionsVisible;
        songAttributes.set(interaction.guild!.id, {
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
                    songAttributes.get(interaction.guild!.id)?.isLooping ||
                      false
                  ),
                ]
              : [playerRow()],
            embeds: [createPlayerEmbed(interaction, song)],
          });
        }
        break;
      case "shuffle":
        const currSong = shuffleQueue(interaction.guild!.id);
        await inter.editReply({
          content: " ",
          components: [playerRow()],
          embeds: [createPlayerEmbed(interaction, currSong)],
        });
        break;
      case "loop":
        songAttributes.set(interaction.guild!.id, {
          ...attributes,
          isLooping: !attributes?.isLooping,
        });
        await inter.editReply({
          content: " ",
          components: [
            playerRow(),
            playerOptionsRow(
              songAttributes.get(interaction.guild!.id)?.isLooping || false
            ),
          ],
          embeds: [createPlayerEmbed(interaction, song)],
        });
        break;
      case "remove":
        const index = currentSong.get(interaction.guild!.id)?.index;
        if (index === undefined) return;
        const result = removeSongFromQueue(interaction.guild!.id, index);
        if (result) {
          setCurrentSong(interaction.guild!.id, index - 1);
          const res = await playNext(interaction.guild!.id, bot);
          if (!res) play(interaction.guild!.id, bot);
        } else {
          await inter.editReply("Failed to remove song from queue!");
        }
        break;
      case "stop":
        if (subscription) {
          subscription.player.stop();
          subscriptions.delete(interaction.guild!.id);
        }
        getVoiceConnection(interaction.guild!.id)?.destroy();
        currentSong.delete(interaction.guild!.id);
        songAttributes.delete(interaction.guild!.id);
        bot.interactions.delete(interaction.guild!.id);

        await inter.editReply({
          content: "Stopped playing!",
          components: [],
          embeds: [],
        });
        break;
      default:
        break;
    }
    if (
      !(interaction.customId === "options" || interaction.customId === "loop")
    )
      bot.songAttributes.set(interaction.guild!.id, {
        ...bot.songAttributes.get(interaction.guild!.id),
        optionsVisible: false,
      });
    await interaction.deferUpdate();
  } else if (interaction.isStringSelectMenu()) {
    // respond to the select menu
  }
};
