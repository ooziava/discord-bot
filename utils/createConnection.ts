import {
  VoiceConnection,
  VoiceConnectionStatus,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { checkUser } from "./checkUser.js";

export const createConnection = (
  interaction: CommandInteraction
): VoiceConnection | null => {
  const channel = checkUser(interaction);
  if (!channel) {
    return null;
  }

  const connection =
    getVoiceConnection(channel.guild.id) ||
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

  if (channel.id !== connection.joinConfig.channelId) {
    connection.rejoin({
      channelId: channel.id,
      selfDeaf: true,
      selfMute: false,
    });
  }

  connection.on("error", (error) => {
    console.error(error);
    connection.destroy();
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    connection.destroy();
  });

  return connection;
};
