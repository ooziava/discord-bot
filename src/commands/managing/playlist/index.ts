import { SlashCommandBuilder, Message } from "discord.js";

import { ELEMENTS_PER_PAGE, MIN_QUERY_LENGTH } from "../../../constants/index.js";
import { PlaylistService, GuildService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import addPlaylist from "./add.js";
import infoPlaylist from "./info.js";
import playPlaylist from "./play.js";
import removePlaylist from "./remove.js";

import type { Aliases, Autocomplete, Data, Execute } from "../../../types/command.js";

export const aliases: Aliases = "pl";
export const data: Data = new SlashCommandBuilder()
  .setName("playlist")
  .setDescription("Manage the playlist")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Save playlist")
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("The URL of the playlist to save")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove a playlist")
      .addStringOption((option) =>
        option
          .setName("playlist")
          .setDescription("The playlist to remove")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("play")
      .setDescription("Play the playlist")
      .addStringOption((option) =>
        option
          .setName("playlist")
          .setDescription("The playlist to play")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  // .addSubcommand((subcommand) =>
  //   subcommand
  //     .setName("modify")
  //     .setDescription("Modify a playlist")
  //     .addStringOption((option) =>
  //       option
  //         .setName("playlist")
  //         .setDescription("The playlist to modify")
  //         .setRequired(true)
  //         .setAutocomplete(true)
  //     )
  // )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("info")
      .setDescription("Get information about the playlist")
      .addStringOption((option) =>
        option
          .setName("playlist")
          .setDescription("The playlist to get information about")
          .setAutocomplete(true)
      )
  );
// .addSubcommand((subcommand) => subcommand.setName("create").setDescription("Create a playlist"))
// .addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Clear the playlists"));

export const execute: Execute = async (client, interaction, args) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();

  const query =
    interaction instanceof Message
      ? args?.slice(1).join(" ")
      : interaction.options.getString("playlist") || undefined;

  switch (subcommand) {
    case "add":
      let input;
      if (interaction instanceof Message) {
        input = args?.[1];
        if (!input) {
          await reply(interaction, "Please provide a playlist URL.", true);
          return;
        }
      } else {
        input = interaction.options.getString("url", true);
      }

      await addPlaylist(interaction, input);
      return;

    case "remove":
    case "rm":
      if (!query) {
        await reply(interaction, "Please provide a playlist name or url to remove.", true);
        return;
      }

      await removePlaylist(interaction, query);
      return;

    case "info":
      await infoPlaylist(interaction, query);
      return;

    case "play":
      if (!query) {
        await reply(interaction, "Please provide a playlist name or url to remove.", true);
        return;
      }

      await playPlaylist(interaction, query);
      return;
    // case "create":
    //   return await reply(interaction, "Available soon.");

    // case "modify":
    //   if (!query)
    //     return await reply(interaction, "Please provide a playlist name or url to modify.", true);

    //   return await reply(interaction, "Available soon.", true);

    // case "clear":
    //   return await clearPlaylists(interaction);
    default:
      await reply(interaction, "Please provide a valid subcommand.", true);
      return;
  }
};

export const autocomplete: Autocomplete = async (interaction) => {
  const subcommand = interaction.options.getSubcommand();
  const focusedValue = interaction.options.getFocused();

  switch (subcommand) {
    case "add": {
      if (!focusedValue || focusedValue.length < MIN_QUERY_LENGTH) {
        await interaction.respond([]);
        return;
      }
      const playlists = await PlaylistService.search(focusedValue, ELEMENTS_PER_PAGE);
      const filteredList = playlists.map((pl) => ({ name: pl.name, value: pl.url }));

      await interaction.respond(filteredList);
      return;
    }
    case "play":
    case "info":
    case "remove":
    case "modify":
      let playlists;
      if (focusedValue && focusedValue.length > 3) {
        playlists = await GuildService.searchPlaylists(
          interaction.guildId,
          focusedValue,
          ELEMENTS_PER_PAGE
        );
      } else {
        playlists = await GuildService.getPlaylists(interaction.guildId, ELEMENTS_PER_PAGE);
      }

      const filteredList = playlists.map((pl, i) => ({
        name: `${i + 1}. ${pl.name} - ${pl.artist} (${pl.source})`.slice(0, 100),
        value: pl.url,
      }));

      await interaction.respond(filteredList);
      return;
    default:
      await interaction.respond([]);
      return;
  }
};
