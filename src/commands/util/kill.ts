import { SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder().setName("kill").setDescription("Kill the bot");

export const execute: Execute = async (client, interaction) => {
  const connection = getVoiceConnection(interaction.guildId);
  if (connection) connection.destroy();

  const player = client.players.get(interaction.guildId);
  if (player) {
    client.players.delete(interaction.guildId);
    player.stop();
  }

  await interaction.reply("Goodbye!");
};
