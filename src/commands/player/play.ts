import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) => option.setName("url").setDescription("The URL of the song to play"));

export const execute = async (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => {
  const url = interaction instanceof Message ? args?.[0] : interaction.options.getString("url");
  if (!url) return await interaction.reply("Play last song in queue");
  await interaction.reply(`Playing song from ${url}`);
};
