import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("previous")
  .setDescription("Play the previous song");

export const execute = async (interaction: ChatInputCommandInteraction | Message) => {
  await interaction.reply("Playing the previous song");
};
