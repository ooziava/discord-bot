import {
  VoiceConnection,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { CommandInteraction, GuildMember } from "discord.js";

export default (
  interaction: CommandInteraction
): VoiceConnection | undefined => {
  const channel = (interaction.member as GuildMember)?.voice.channel;
  if (!channel) {
    interaction.reply({
      content: "You need to be in a voice channel to use this command",
      ephemeral: true,
    });
    return;
  }

  const connection =
    getVoiceConnection(channel.guild.id) ||
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

  connection.on("error", (error) => {
    console.error(error);
    connection.destroy();
  });

  return connection;
};
