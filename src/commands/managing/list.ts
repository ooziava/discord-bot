import { SlashCommandBuilder, Message } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Show the list")
  .addSubcommand((subcommand) =>
    subcommand.setName("queue").setDescription("Show songs in the queue")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("plylists").setDescription("Show the playlists")
  );

export const execute: Execute = async (interaction, args) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();
  switch (subcommand) {
    case "queue":
      await interaction.reply("Showing queue");
      break;
    case "plylists":
      await interaction.reply("Showing playlists");
      break;
    default:
      await interaction.reply("Please provide a subcommand.");
  }
};
