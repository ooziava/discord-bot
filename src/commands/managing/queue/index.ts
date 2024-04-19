import { SlashCommandBuilder, Message } from "discord.js";
import { AudioPlayerStatus } from "@discordjs/voice";

import GuildService from "../../../services/guild.js";
import { reply } from "../../../utils/reply.js";
import * as playCommand from "../../player/play.js";

import infoQueue from "./info.js";
import addToQueue from "./add.js";
import clearQueue from "./clear.js";
import removeFromQueue from "./remove.js";

import type { Aliases, Autocomplete, Data, Execute } from "../../../types/command.js";

export const aliases: Aliases = "q";
export const data: Data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Manage the queue")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Add a song to the queue")
      .addStringOption((option) =>
        option.setName("song").setDescription("The URL of the song to add").setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove a song from the queue")
      .addStringOption((option) =>
        option
          .setName("song")
          .setDescription("The song to remove")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("info").setDescription("Get information about the queue")
  )
  .addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Clear the queue"));

export const execute: Execute = async (client, interaction, args) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();

  switch (subcommand) {
    case "add":
      const url =
        interaction instanceof Message ? args?.[1] : interaction.options.getString("song", true);
      if (!url) return await reply(interaction, "Please provide a URL to add.", true);

      await addToQueue(interaction, url);

      const player = client.players.get(interaction.guildId);
      if (!player || player.state.status === AudioPlayerStatus.Idle)
        await playCommand.execute(client, interaction);
      return;

    case "remove":
    case "rm":
      const search =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("song") || undefined;
      if (!search) return await reply(interaction, "Please provide a song to remove.", true);

      return await removeFromQueue(interaction, search);
    case "info":
      return await infoQueue(interaction);
    case "clear":
      return await clearQueue(interaction);
    default:
      return await reply(interaction, "Please provide a subcommand.", true);
  }
};

export const autocomplete: Autocomplete = async (interaction) => {
  const subcommand = interaction.options.getSubcommand();
  const focusedValue = interaction.options.getFocused();
  if (subcommand === "remove") {
    const songs = focusedValue
      ? await GuildService.searchInQueue(interaction.guildId, focusedValue, 15)
      : await GuildService.getQueue(interaction.guildId, 15);

    return await interaction.respond(
      songs.map((s, i) => ({
        name: `${i + 1}. ${s.title} - ${s.artist}`.slice(0, 100),
        value: s.url,
      }))
    );
  }
};
