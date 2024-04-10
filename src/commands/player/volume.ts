import { SlashCommandBuilder, Message } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("volume")
  .setDescription("Set the volume of the player")
  .addIntegerOption((option) =>
    option.setName("volume").setDescription("The volume to set").setRequired(true)
  );

export const execute: Execute = async (interaction, args) => {
  let volume;
  if (interaction instanceof Message) {
    const volumeArg = args?.[0];
    if (!volumeArg) return await interaction.reply("Please provide a volume.");
    volume = parseInt(volumeArg);
  } else {
    volume = interaction.options.getInteger("volume", true);
  }
  await interaction.reply(`Setting volume to ${volume}`);
};