import {
  VoiceConnection,
  VoiceConnectionStatus,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import checkUser from "./checkUser.js";

export default (interaction: CommandInteraction): VoiceConnection | null => {
  const channel = checkUser(interaction);
  if (channel) {
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

    connection.on(VoiceConnectionStatus.Disconnected, () => {
      connection.destroy();
    });

    return connection;
  } else {
    return null;
  }
};
