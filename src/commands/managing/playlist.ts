import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const aliases = "pl";
export const data = new SlashCommandBuilder()
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
  );

export const execute = async (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();

  switch (subcommand) {
    case "add":
      const url = interaction instanceof Message ? args?.[1] : interaction.options.getString("url");
      if (!url) return await interaction.reply("Please provide a URL to save.");
      await interaction.reply(`Saving playlist from ${url}`);
      break;
    case "remove":
      const search =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("playlist");
      if (!search)
        return await interaction.reply("Please provide a playlist name or url to remove.");
      await interaction.reply(`Removing playlist ${search}`);
      break;
    case "info":
      const playlist =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("playlist");
      if (!playlist) return await interaction.reply("Please provide a playlist name or url.");
      await interaction.reply(`Getting information about the playlist ${playlist}`);
      break;
    case "play":
      const playlistPlay =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("playlist");
      if (!playlistPlay) return await interaction.reply("Please provide a playlist name or url.");
      await interaction.reply(`Playing the playlist ${playlistPlay}`);
      break;
    case "create":
      await interaction.reply("Creating a playlist");
      break;
    case "modify":
      const playlistModify =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("playlist");
      if (!playlistModify) return await interaction.reply("Please provide a playlist name or url.");
      await interaction.reply(`Modifying the playlist ${playlistModify}`);
      break;
    default:
      await interaction.reply("Please provide a subcommand.");
  }
};
