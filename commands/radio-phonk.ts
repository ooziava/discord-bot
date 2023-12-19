import { GuildMember, SlashCommandBuilder } from "discord.js";
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { stream } from "play-dl";
import notrack from "../components/notrack.js";
import consola from "consola";

const AVAILABLE_STREAMS = [
  "https://edge01.atomicradio.eu/hillchill/highquality",
  "https://s2.radio.co/s2b2b68744/listen",
  "https://www.youtube.com/watch?v=8v_kKMaq5po&ab_channel=rarephonk",
  "https://www.youtube.com/watch?v=ZkueKuoB27k&pp=ygULcmFkaW8gcGhvbms%3D",
  "https://www.youtube.com/watch?v=S6helKOW5P0&pp=ygULcmFkaW8gcGhvbms%3D",
  "https://www.youtube.com/watch?v=F88_5F3jRcM&pp=ygULcmFkaW8gcGhvbms%3D",
];

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("radio-phonk")
  .setDescription("Play a live radio stream");

export const execute: ExecuteCommand = async (interaction, client) => {
  const channel = (interaction.member as GuildMember)?.voice.channel;
  if (!channel) throw new Error("You must be in a voice channel to play a song!");

  const guild = interaction.guild;
  if (!guild) throw new Error("There was an error while reading your guild ID!");

  let subscription = client.subscriptions.get(guild.id);
  if (subscription) throw new Error("There is already a song playing!");

  let connection = getVoiceConnection(guild.id);
  if (!connection) {
    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild?.voiceAdapterCreator!,
    });
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      const subscription = client.subscriptions.get(guild.id);
      if (subscription) {
        subscription.player.removeAllListeners();
        subscription.player.stop();
        subscription.connection.destroy();

        subscription.unsubscribe();
        client.subscriptions.delete(guild.id);
      }
    });
  }

  const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
  subscription = connection.subscribe(player)!;
  client.subscriptions.set(guild.id, subscription);

  player.on("error", (error) => {
    consola.error(error);
    subscription?.connection.destroy();
    client.subscriptions.delete(guild.id);
  });

  player.on(AudioPlayerStatus.Idle, async () => {
    const subscription = client.subscriptions.get(guild.id);
    if (subscription) {
      subscription.player.removeAllListeners();
      subscription.player.stop();
      subscription.connection.destroy();

      subscription.unsubscribe();
      client.subscriptions.delete(guild.id);
    }
  });

  await interaction.deferReply();
  for (const url of AVAILABLE_STREAMS) {
    try {
      let resource;
      if (url.includes("youtube")) {
        const audiostream = await stream(url, { quality: 2, seek: 0 });
        if (!audiostream) throw new Error("There was an error while streaming the song!");
        resource = createAudioResource(audiostream.stream, { inputType: audiostream.type });
      } else {
        resource = createAudioResource(url);
      }

      player.play(resource);
      consola.success("Stream on " + url + " started");
      return await interaction.followUp({
        embeds: [notrack("Enjoy listening to the phonk radio!")],
      });
    } catch (error: any) {
      consola.error("Stream on " + url + " failed\n" + error);
    }
  }
  await interaction.followUp({ embeds: [notrack("There no available streams!")] });
};
