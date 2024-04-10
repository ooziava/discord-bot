import { SlashCommandBuilder, Message } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("Search for a song")
  .addStringOption((option) =>
    option.setName("query").setDescription("The query to search for").setRequired(true)
  );

export const execute: Execute = async (interaction, args) => {
  const query =
    interaction instanceof Message ? args?.join(" ") : interaction.options.getString("query", true);

  if (!query) return await interaction.reply("Please provide a query to search for.");
  await interaction.reply(`Searching for ${query}`);
};
