import { SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder().setName("kill").setDescription("Kill the bot");
export const execute: Execute = async (client, interaction) => {
  await interaction.reply("Killing the bot");
};
