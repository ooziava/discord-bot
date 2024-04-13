import { SlashCommandBuilder, Message } from "discord.js";
import type { Aliases, Autocomplete, Data, Execute } from "../../../types/command.js";
import reply from "../../../utils/reply.js";
import addPlaylist from "./add.js";
import removePlaylist from "./remove.js";
import infoPlaylist from "./info.js";
import playPlaylist from "./play.js";
import clearPlaylists from "./clear.js";
import PlaylistService from "../../../services/playlist.js";
import GuildService from "../../../services/guild.js";

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
        option.setName("playlist").setDescription("The playlist to remove").setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("info")
      .setDescription("Get information about the playlist")
      .addStringOption((option) =>
        option
          .setName("playlist")
          .setDescription("The playlist to get information about")
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
  .addSubcommand((subcommand) => subcommand.setName("create").setDescription("Create a playlist"))
  .addSubcommand((subcommand) =>
    subcommand
      .setName("modify")
      .setDescription("Modify a playlist")
      .addStringOption((option) =>
        option.setName("playlist").setDescription("The playlist to modify").setRequired(true)
      )
  )
  .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List the playlists"))
  .addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Clear the playlists"));

export const execute: Execute = async (interaction, args) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();

  const query =
    interaction instanceof Message
      ? args?.slice(1).join(" ")
      : interaction.options.getString("playlist");

  switch (subcommand) {
    case "add":
      let input;
      if (interaction instanceof Message) {
        input = args?.[1];
        if (!input) return await reply(interaction, "Please provide a playlist URL.", true);
      } else {
        input = interaction.options.getString("url", true);
        await interaction.deferReply();
      }

      return await addPlaylist(interaction, input);

    case "remove":
      if (!query)
        return await reply(interaction, "Please provide a playlist name or url to remove.", true);
      else return await removePlaylist(interaction, query);

    case "info":
      if (!query)
        return await reply(interaction, "Please provide a playlist name or url to remove.", true);
      else return await infoPlaylist(interaction, query);

    case "play":
      if (!query)
        return await reply(interaction, "Please provide a playlist name or url to remove.", true);
      else return await playPlaylist(interaction, query);

    case "create":
      return await reply(interaction, "Available soon.");

    case "modify":
      if (!query)
        return await reply(interaction, "Please provide a playlist name or url to remove.", true);

      return await reply(interaction, "Available soon.");

    case "list":
      const playlists = await GuildService.getPlaylists(interaction.guildId);
      if (!playlists.length) return await reply(interaction, "No playlists saved.");

      const count = playlists.length;

      return await reply(interaction, {
        embeds: [
          {
            title: "Saved Playlists",
            fields: [
              {
                name: "",
                value:
                  playlists
                    .map((playlist, i) => `${i + 1}. ${playlist.name}`)
                    .slice(0, 15)
                    .join("\n") + (count > 15 ? `\n...and ${count - 15} more` : ""),
              },
            ],
            //dark blue
            color: 0x00008b,
          },
        ],
      });

    case "clear":
      return await clearPlaylists(interaction);
    default:
      await reply(interaction, "Please provide a valid subcommand.", true);
  }
};

export const autocomplete: Autocomplete = async (interaction) => {
  const subcommand = interaction.options.getSubcommand();
  const focusedValue = interaction.options.getFocused();

  switch (subcommand) {
    case "add": {
      const playlists =
        focusedValue && focusedValue.length > 2
          ? await PlaylistService.search(focusedValue)
          : await PlaylistService.getAll();
      return await interaction.respond(
        playlists?.slice(0, 15).map((choice) => ({ name: choice.name, value: choice.url })) || []
      );
    }
    case "play":
    case "info":
    case "remove":
    case "modify":
      const playlists = await GuildService.getPlaylists(interaction.guildId);
      const filtered = playlists.filter((playlist) =>
        playlist.name.toLowerCase().startsWith(focusedValue.toLowerCase())
      );

      return await interaction.respond(
        filtered.map((choice) => ({ name: choice.name, value: choice.url }))
      );
    default:
      return await interaction.respond([]);
  }
};
