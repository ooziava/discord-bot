import { SlashCommandBuilder } from "discord.js";

import guildInfoEmbed from "../../embeds/guild-info.js";

import GuildService from "../../services/guild.js";

import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get information about the bot");

export const execute: Execute = async (client, interaction) => {
  const guild = await GuildService.getGuild(interaction.guildId);

  return interaction.reply({
    embeds: [guildInfoEmbed(guild, interaction.guild?.name || "Unknown")],
  });
};
