import { SlashCommandBuilder, Message } from "discord.js";

import GuildService from "../../services/guild.js";

import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("prefix")
  .setDescription("Change the prefix")
  .addStringOption((option) =>
    option.setName("prefix").setDescription("The new prefix").setRequired(true)
  );

export const execute: Execute = async (client, interaction, args) => {
  let prefix;
  if (interaction instanceof Message) {
    prefix = args?.[0];
    if (!prefix) {
      await interaction.reply("Please provide a prefix.");
      return;
    }
  } else {
    prefix = interaction.options.getString("prefix", true);
  }

  await GuildService.setPrefix(interaction.guildId, prefix);
  client.prefixes.set(interaction.guildId, prefix);

  await interaction.reply(`Prefix set to \`${prefix}\``);
};
