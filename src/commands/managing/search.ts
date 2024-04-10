import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("Search for a song")
  .addStringOption((option) =>
    option.setName("query").setDescription("The query to search for").setRequired(true)
  );

export const execute = async (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => {
  const query =
    interaction instanceof Message ? args?.join(" ") : interaction.options.getString("query", true);

  if (!query) return await interaction.reply("Please provide a query to search for.");
  await interaction.reply(`Searching for ${query}`);
};
