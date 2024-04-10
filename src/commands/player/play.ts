import { SlashCommandBuilder, Message } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) => option.setName("url").setDescription("The URL of the song to play"));

export const execute: Execute = async (interaction, args) => {
  const url = interaction instanceof Message ? args?.[0] : interaction.options.getString("url");
  if (!url) return await interaction.reply("Play last song in queue");
  await interaction.reply(`Playing song from ${url}`);
};
