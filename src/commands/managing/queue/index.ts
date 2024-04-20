import { SlashCommandBuilder, Message } from "discord.js";

import { ELEMENTS_PER_PAGE } from "../../../constants/index.js";
import GuildService from "../../../services/guild.js";
import { reply } from "../../../utils/reply.js";

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

export const execute: Execute = async (_client, interaction, args) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();

  switch (subcommand) {
    case "add":
      const url =
        interaction instanceof Message ? args?.[1] : interaction.options.getString("song", true);

      if (!url) {
        await reply(interaction, "Please provide a URL to add.", true);
        return;
      }

      await addToQueue(interaction, url);
      return;

    case "remove":
    case "rm":
      const query =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("song", true);

      if (!query) {
        await reply(interaction, "Please provide a song to remove.", true);
        return;
      }

      await removeFromQueue(interaction, query);
      return;
    case "info":
      await infoQueue(interaction);
      return;
    case "clear":
      await clearQueue(interaction);
      return;
    default:
      await reply(interaction, "Please provide a subcommand.", true);
      return;
  }
};

export const autocomplete: Autocomplete = async (interaction) => {
  const subcommand = interaction.options.getSubcommand();
  const focusedValue = interaction.options.getFocused();
  if (subcommand === "remove") {
    const songs = focusedValue
      ? await GuildService.searchInQueue(interaction.guildId, focusedValue, ELEMENTS_PER_PAGE)
      : await GuildService.getQueue(interaction.guildId, ELEMENTS_PER_PAGE);

    const filteredList = songs.map((s, i) => ({
      name: `${i + 1}. ${s.title} - ${s.artist}`.slice(0, 100),
      value: s.url,
    }));

    await interaction.respond(filteredList);
  }
};
