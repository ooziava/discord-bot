import { SlashCommandBuilder } from "discord.js";

import type { Aliases, Data, Execute } from "../../types/command.js";
import { AudioPlayerStatus } from "@discordjs/voice";

export const aliases: Aliases = "p";
export const data: Data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pause the player");

export const execute: Execute = async (client, interaction) => {
  const player = client.players.get(interaction.guildId);
  if (!player) {
    await interaction.reply("No songs are playing");
    return;
  }

  if (player.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    await interaction.reply("Unpaused");
    return;
  } else if (player.state.status === AudioPlayerStatus.Playing) {
    player.pause();
    await interaction.reply("Paused");
    return;
  } else {
    await interaction.reply("Player is not playing");
    return;
  }
};
