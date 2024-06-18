import { SlashCommandBuilder, Message } from "discord.js";

import GuildService from "../../services/guild.js";
import { reply } from "../../utils/reply.js";

import type { Aliases, Data, Execute } from "../../types/command.js";

export const aliases: Aliases = "vol";
export const data: Data = new SlashCommandBuilder()
  .setName("volume")
  .setDescription("Set the volume of the player")
  .addIntegerOption((option) =>
    option.setName("volume").setDescription("The volume to set").setRequired(true)
  );

export const execute: Execute = async (_client, interaction, args) => {
  let volume;
  if (interaction instanceof Message) {
    const volumeArg = args?.[0];
    if (!volumeArg) {
      await interaction.reply("Please provide a volume.");
      return;
    }

    volume = parseInt(volumeArg);
  } else {
    volume = interaction.options.getInteger("volume", true);
  }
  const result = await GuildService.setVolume(interaction.guildId, volume);
  if (!result.modifiedCount) {
    await reply(interaction, "Failed to set volume");
    return;
  }

  await reply(interaction, `Volume set to ${volume}`);
};
