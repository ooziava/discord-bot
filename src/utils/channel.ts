import consola from "consola";
import type { VoiceBasedChannel } from "discord.js";
import {
  entersState,
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";

import type MyClient from "../client.js";

export async function connectToChannel(client: MyClient, channel: VoiceBasedChannel) {
  const existedConnection = getVoiceConnection(channel.guild.id);
  if (existedConnection) {
    return existedConnection;
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  connection.on("error", consola.error);

  connection.on(VoiceConnectionStatus.Disconnected, async (_oldState, _newState) => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch (error) {
      try {
        connection.destroy();
        const player = client.players.get(channel.guild.id);
        if (player) {
          player.stop();
          client.players.delete(channel.guild.id);
        }
      } catch (error) {}
    }
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    return connection;
  } catch (error) {
    try {
      connection.destroy();
    } catch (error) {}
    throw error;
  }
}
