import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "interfaces/discordjs";

const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Joins the voice channel you are in.");

const execute = async (interaction: CommandInteraction) => {
  const channel = (interaction.member as GuildMember).voice.channel;

  if (!channel) {
    await interaction.reply(`You are not in a voice channel.`);
    return;
  }

  const connection =
    getVoiceConnection(channel.guildId) ||
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

  connection.on("error", () => {
    connection.destroy();
  });

  await interaction.reply(`Joined`);
};

export const command: Command = {
  data,
  execute,
};
