import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("random")
  .setDescription("Get a random number between 1 and 100");

export const execute: Execute = async (interaction) => {
  await interaction.reply((Math.floor(Math.random() * 100) + 1).toString());
};
