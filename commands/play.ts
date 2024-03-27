import { type GuildMember, SlashCommandBuilder } from "discord.js";
import { is_expired, refreshToken, stream } from "play-dl";
import consola from "consola";
import {
  type AudioPlayerState,
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  getVoiceConnection,
  createAudioResource,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
} from "@discordjs/voice";

import track from "../components/track.js";
import notrack from "../components/notrack.js";

import { addSongToQueue } from "../services/add-song.js";
import { clearSongs, getNextSong, getSong } from "../utils/mongo.js";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
// const INACTIVITY_TIMEOUT = 10000;

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) =>
    option.setName("song").setDescription("The song to play").setRequired(true)
  );

export const execute: ExecuteCommand = async (interaction, client) => {
  const channel = (interaction.member as GuildMember)?.voice.channel;
  if (!channel) throw new Error("You must be in a voice channel to play a song!");

  const guild = interaction.guild;
  if (!guild) throw new Error("There was an error while reading your guild ID!");

  const connectionOptions = {
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild?.voiceAdapterCreator!,
  };

  //Define timeout functions
  const stopTimeout = () => {
    const timer = client.timers.get(guild.id);
    if (timer) {
      clearTimeout(timer);
      client.timers.delete(guild.id);
    }
  };
  const startTimeout = () => {
    stopTimeout();
    if (!client.subscriptions.has(guild.id)) return;
    const subscription = client.subscriptions.get(guild.id)!;
    const onTimeout = async () => {
      subscription.connection?.disconnect();
      await interaction.channel?.send({ embeds: [notrack("Inactivity timeout reached!")] });
    };
    const newTimer = setTimeout(onTimeout, INACTIVITY_TIMEOUT);
    client.timers.set(guild.id, newTimer);
  };

  // Define listener functions
  const clearSubscription = async () => {
    if (!client.subscriptions.has(guild.id)) return;
    const subscription = client.subscriptions.get(guild.id)!;
    subscription.player.removeAllListeners();
    subscription.player.stop();
    subscription.unsubscribe();

    client.subscriptions.delete(guild.id);
    client.currentSongs.delete(guild.id);
    stopTimeout();
  };
  const onPlayerIdle = async () => {
    const subscription = client.subscriptions.get(guild.id);
    const currentSong = client.currentSongs.get(guild.id);
    if (!subscription || !currentSong) return;

    const nextSong = await getNextSong(guild.id, currentSong?.id!);
    if (!nextSong) {
      startTimeout();
      // clearSubscription();
      return await interaction.channel?.send({ embeds: [notrack("No more songs in queue!")] });
    }

    stopTimeout();
    const audiostream = await stream(nextSong.url, { quality: 2 });
    const resource = createAudioResource(audiostream.stream, {
      inputType: audiostream.type,
    });
    subscription.player.play(resource);
    client.currentSongs.set(guild.id, nextSong);
    await interaction.channel?.send({ embeds: [track(nextSong)] });
  };

  const song = interaction.options.get("song", true).value;
  if (typeof song !== "string") throw new Error("There was an error while reading your song name!");

  const subscription = client.subscriptions.get(guild.id);
  if (!subscription) {
    await interaction.deferReply();
    await interaction.editReply({ embeds: [notrack("Searching for your song...")] });

    if (is_expired()) await refreshToken();
    await clearSongs(guild.id);
    await addSongToQueue(song, interaction, client);

    const currentSong = await getSong(guild.id, 0);
    if (!currentSong) throw new Error("There was an error while saving your song!");

    const audiostream = await stream(currentSong.url, { quality: 2 });
    const resource = createAudioResource(audiostream.stream, {
      inputType: audiostream.type,
    });

    const connection = joinVoiceChannel(connectionOptions);
    connection.on(VoiceConnectionStatus.Disconnected, clearSubscription);

    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
    const newSubscription = connection.subscribe(player)!;
    player.play(resource);
    player.on(AudioPlayerStatus.Idle, onPlayerIdle);

    client.currentSongs.set(guild.id, currentSong);
    client.subscriptions.set(guild.id, newSubscription);
    await interaction.followUp({ embeds: [track(currentSong)] });
  } else {
    const connection = subscription.connection;
    const player = subscription.player;
    if (connection?.joinConfig.channelId != channel.id)
      throw new Error("You must be in the same voice channel as the bot to play a song!");

    await addSongToQueue(song, interaction, client);
    if (player.state.status === AudioPlayerStatus.Idle) onPlayerIdle();
  }
};
