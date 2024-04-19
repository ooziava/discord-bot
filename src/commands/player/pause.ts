import { SlashCommandBuilder } from "discord.js";

import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pause the player");

export const execute: Execute = async (client, interaction) => {
  const player = client.players.get(interaction.guildId);
  if (!player) return await interaction.reply("Bot is not in a voice channel");
  player.pause();
  return await interaction.reply("Pausing the player");
};
