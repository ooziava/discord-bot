import { SlashCommandBuilder, Message } from "discord.js";
import { AudioPlayerStatus } from "@discordjs/voice";

import { PlaylistService, GuildService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";
import * as playCommand from "../../player/play.js";

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
        if (!input) return await reply(interaction, "Please provide a playlist URL.", true);
        await reply(interaction, "Searching for the playlist...");
      } else {
        input = interaction.options.getString("url", true);
        await interaction.deferReply();
      }

      return await addPlaylist(interaction, input);

    case "remove":
    case "rm":
      if (!query)
        return await reply(interaction, "Please provide a playlist name or url to remove.", true);
      return await removePlaylist(interaction, query);

    case "info":
      return await infoPlaylist(interaction, query);

    case "play":
      if (!query)
        return await reply(interaction, "Please provide a playlist name or url to remove.", true);

      await playPlaylist(interaction, query);

      const player = client.players.get(interaction.guildId);
      if (!player || player.state.status === AudioPlayerStatus.Idle)
        await playCommand.execute(client, interaction);
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
      return await reply(interaction, "Please provide a valid subcommand.", true);
  }
};

export const autocomplete: Autocomplete = async (interaction) => {
  const subcommand = interaction.options.getSubcommand();
  const focusedValue = interaction.options.getFocused();

  switch (subcommand) {
    case "add": {
      const playlists =
        focusedValue && focusedValue.length > 3
          ? await PlaylistService.search(focusedValue, 15)
          : await PlaylistService.getAll(15);
      return await interaction.respond(playlists.map((pl) => ({ name: pl.name, value: pl.url })));
    }
    case "play":
    case "info":
    case "remove":
    case "modify":
      const playlists =
        focusedValue && focusedValue.length > 3
          ? await GuildService.searchPlaylists(interaction.guildId, focusedValue, 15)
          : await GuildService.getPlaylists(interaction.guildId, 15);

      return await interaction.respond(
        playlists.map((pl, i) => ({
          name: `${i + 1}. ${pl.name} - ${pl.artist} (${pl.source})`.slice(0, 100),
          value: pl.url,
        }))
      );
    default:
      return await interaction.respond([]);
  }
};
