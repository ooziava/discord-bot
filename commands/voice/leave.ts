import { getVoiceConnection } from "@discordjs/voice";
import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "interfaces/discordjs";

const data = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("Leaves the voice channel you are in.");

const execute = async (interaction: CommandInteraction) => {
  const channel = (interaction.member as GuildMember).voice.channel;

  if (!channel) {
    await interaction.reply(`You are not in a voice channel.`);
    return;
  }

  const connection = getVoiceConnection(channel.guild.id);
  if (!connection) {
    await interaction.reply(`I am not in a voice channel.`);
    return;
  }

  connection.destroy();
  await interaction.reply(`Left`);
};

export const command: Command = {
  data,
  execute,
};
