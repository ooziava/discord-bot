import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get information about the bot");

export const execute = async (interaction: ChatInputCommandInteraction | Message) => {
  await interaction.reply("Getting information about the bot");
};
