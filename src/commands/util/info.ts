import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Provides information about a user or the server")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("user")
      .setDescription("Info about a user")
      .addUserOption((option) => option.setName("target").setDescription("The user"))
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("server").setDescription("Info about the server")
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.options.getSubcommand() === "user") {
    const user = interaction.options.getUser("target");

    if (user) {
      await interaction.reply(`Username: ${user.username}\nID: ${user.id}`);
    } else {
      await interaction.reply(
        `Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`
      );
    }
  } else if (interaction.options.getSubcommand() === "server") {
    await interaction.reply(
      `Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`
    );
  }
};
