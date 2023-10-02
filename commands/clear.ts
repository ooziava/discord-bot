import { SlashCommandBuilder } from "discord.js";
import { clearSongs } from "../mongo.js";

export const data = new SlashCommandBuilder().setName("clear").setDescription("Clears the queue");

export const execute: Execute = async (interaction, client) => {
  await interaction.deferReply();
  const res = await clearSongs(interaction.guildId!);
  const content = res ? "Queue cleared!" : "Error while clearing queue!";
  await interaction.followUp({ content, ephemeral: true });
};
