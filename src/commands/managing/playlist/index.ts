import { SlashCommandBuilder, Message } from "discord.js";
import type { Aliases, Data, Execute } from "../../../types/command.js";
import reply from "../../../utils/reply.js";
import addPlaylist from "./add.js";
import removePlaylist from "./remove.js";
import infoPlaylist from "./info.js";
import playPlaylist from "./play.js";
import clearPlaylists from "./clear.js";

export const aliases: Aliases = "pl";
export const data: Data = new SlashCommandBuilder()
  .setName("playlist")
  .setDescription("Manage the playlist")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Save playlist")
      .addStringOption((option) =>
        option.setName("url").setDescription("The URL of the playlist to save").setRequired(true)
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
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("play")
      .setDescription("Play the playlist")
      .addStringOption((option) =>
        option.setName("playlist").setDescription("The playlist to play").setRequired(true)
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

    case "clear":
      return await clearPlaylists(interaction);
    default:
      await reply(interaction, "Please provide a valid subcommand.", true);
  }
};
