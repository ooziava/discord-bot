import { SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("previous")
  .setDescription("Play the previous song");

export const execute: Execute = async (interaction) => {
  await interaction.reply("Playing the previous song");
};
