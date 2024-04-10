import { SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pause the player");

export const execute: Execute = async (interaction) => {
  await interaction.reply("Pausing the player");
};
