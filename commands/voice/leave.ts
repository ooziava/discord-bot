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
  const channel = (interaction.member as GuildMember).voice.channel!;
  const connection = getVoiceConnection(channel.guild.id)!;
  connection.disconnect();
  connection.destroy();
  await interaction.reply(`Left`);
};

export const command: Command = {
  data,
  execute,
  reqiures: ["requireVoice"],
};
