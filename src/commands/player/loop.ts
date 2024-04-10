import { SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("loop")
  .setDescription("Loop the current song");

export const execute: Execute = async (interaction) => {
  await interaction.reply("Looping the current song");
};
