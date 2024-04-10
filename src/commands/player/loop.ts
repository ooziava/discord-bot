import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("loop")
  .setDescription("Loop the current song");

export const execute = async (interaction: ChatInputCommandInteraction | Message) => {
  await interaction.reply("Looping the current song");
};
