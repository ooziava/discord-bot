import { type CommandInteraction, SlashCommandBuilder, GuildMember } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("user")
  .setDescription("Provides information about the user.");

export const execute = async (interaction: CommandInteraction) => {
  const member = interaction.member as GuildMember;
  await interaction.reply(
    `This command was run by ${interaction.user.username}, who joined on ${member.joinedAt}.`
  );
};
