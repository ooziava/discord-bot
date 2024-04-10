import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Show the list")
  .addSubcommand((subcommand) =>
    subcommand.setName("queue").setDescription("Show songs in the queue")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("plylists").setDescription("Show the playlists")
  );

export const execute = async (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();
  switch (subcommand) {
    case "queue":
      await interaction.reply("Showing queue");
      break;
    case "plylists":
      await interaction.reply("Showing playlists");
      break;
    default:
      await interaction.reply("Please provide a subcommand.");
  }
};
