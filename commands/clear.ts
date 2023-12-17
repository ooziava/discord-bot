import { SlashCommandBuilder } from "discord.js";
import { clearSongs } from "../utils/mongo.js";

export const cooldown = 10;
export const data = new SlashCommandBuilder().setName("clear").setDescription("Clears the queue");

export const execute: ExecuteCommand = async (interaction, client) => {
  await interaction.deferReply();
  const isCleared = await clearSongs(interaction.guildId!);
  const content = isCleared ? "Queue cleared!" : "Error while clearing queue!";
  await interaction.followUp(content);
};
