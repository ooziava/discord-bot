import { SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get information about the bot");

export const execute: Execute = async (interaction) => {
  await interaction.reply("Getting information about the bot");
};
