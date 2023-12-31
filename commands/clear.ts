import { SlashCommandBuilder } from "discord.js";
import { clearSongs } from "../utils/mongo.js";
import notrack from "../components/notrack.js";

export const cooldown = 10;
export const data = new SlashCommandBuilder().setName("clear").setDescription("Clears the queue");

export const execute: ExecuteCommand = async (interaction, client) => {
  await interaction.deferReply();
  const isCleared = await clearSongs(interaction.guildId!);
  const content = isCleared ? "Queue cleared!" : "There was an error while clearing the queue!";
  await interaction.followUp({ embeds: [notrack(content)] });
};
