import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder().setName("pause").setDescription("Pause the player");

export const execute = async (interaction: ChatInputCommandInteraction | Message) => {
  await interaction.reply("Pausing the player");
};
