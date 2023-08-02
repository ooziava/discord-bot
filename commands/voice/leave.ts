import { getVoiceConnection } from "@discordjs/voice";
import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { type Command } from "interfaces/discordjs";

const data = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("Leaves the voice channel you are in.");

const execute = async (interaction: CommandInteraction) => {
  const {
    voice: { channel },
  } = interaction.member as GuildMember;

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
  connection.disconnect();
  connection.removeAllListeners();
  await interaction.reply(`Joined`);
};

export const command: Command = {
  data,
  execute,
};
