import { SlashCommandBuilder } from "discord.js";

import type { Data, Execute } from "../../types/command.js";
import { AudioPlayerStatus } from "@discordjs/voice";

export const data: Data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pause the player");

export const execute: Execute = async (client, interaction) => {
  const player = client.players.get(interaction.guildId);
  if (!player) {
    await interaction.reply("Bot is not in a voice channel");
    return;
  }

  if (player.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    await interaction.reply("Player is already paused");
    return;
  } else if (player.state.status === AudioPlayerStatus.Playing) {
    player.pause();
    await interaction.reply("Player is now paused");
    return;
  } else {
    await interaction.reply("Player is not playing");
    return;
  }
};
