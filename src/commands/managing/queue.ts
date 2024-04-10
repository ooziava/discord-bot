import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const aliases = "q";
export const data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Manage the queue")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Add a song to the queue")
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("The URL of the song to add")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove a song from the queue")
      .addStringOption((option) =>
        option.setName("song").setDescription("The song to remove").setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("info").setDescription("Get information about the queue")
  )
  .addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Clear the queue"));

export const execute = async (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();

  switch (subcommand) {
    case "add":
      const url = interaction instanceof Message ? args?.[1] : interaction.options.getString("url");
      if (!url) return await interaction.reply("Please provide a URL to add.");
      await interaction.reply(`Adding song from ${url} to the queue`);
      break;
    case "remove":
      const search =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("song");
      if (!search) return await interaction.reply("Please provide a song name or url to remove.");
      await interaction.reply(`Removing song ${search} from the queue`);
      break;
    case "info":
      await interaction.reply("Getting information about the queue");
      break;
    case "clear":
      await interaction.reply("Clearing the queue");
      break;
    default:
      await interaction.reply("Please provide a subcommand.");
  }
};
