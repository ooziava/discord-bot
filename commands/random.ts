import { SlashCommandBuilder } from "discord.js";

export const cooldown = 3;
export const data = new SlashCommandBuilder()
  .setName("random")
  .setDescription("Get a random number between 1 and 100");

export const execute: ExecuteCommand = async (interaction) => {
  await interaction.reply((Math.floor(Math.random() * 100) + 1).toString());
};
