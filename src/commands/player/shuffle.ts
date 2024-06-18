import { SlashCommandBuilder } from "discord.js";

import type { Aliases, Data, Execute } from "../../types/command.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import GuildService from "../../services/guild.js";

export const aliases: Aliases = "sh";
export const data: Data = new SlashCommandBuilder()
  .setName("shuffle")
  .setDescription("Shuffle the queue");

export const execute: Execute = async (client, interaction) => {
  await GuildService.shuffle(interaction.guildId);
  await interaction.reply("Shuffled the queue");
};
