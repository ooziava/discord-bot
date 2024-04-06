import { type CommandInteraction, SlashCommandBuilder, GuildMember } from "discord.js";

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Provides information about the server.");

export const execute = async (interaction: CommandInteraction) => {
  await interaction.reply(
    `This server is ${interaction.guild?.name} and has ${interaction.guild?.memberCount} members.`
  );
};
