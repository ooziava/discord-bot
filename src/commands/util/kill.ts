import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder().setName("kill").setDescription("Kill the bot");
export const execute = async (interaction: ChatInputCommandInteraction | Message) => {
  await interaction.reply("Killing the bot");
};
