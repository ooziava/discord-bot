import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  type AudioPlayerState,
} from "@discordjs/voice";
import { SlashCommandBuilder } from "discord.js";
import { GuildMember } from "discord.js";
import { addSongToQueue } from "../services/add-song.js";
import { clearSongs, getNextSong, getSong } from "../utils/mongo.js";
import { is_expired, refreshToken, stream } from "play-dl";
import consola from "consola";
import track from "../components/track.js";
import notrack from "../components/notrack.js";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) =>
    option.setName("song").setDescription("The song to play").setRequired(true)
  );

export const execute: ExecuteCommand = async (interaction, client) => {
  // Check if connection is available
  const channel = (interaction.member as GuildMember)?.voice.channel;
  if (!channel) throw new Error("You must be in a voice channel to play a song!");

  const guild = interaction.guild;
  if (!guild) throw new Error("There was an error while reading your guild ID!");

  // Define connection options
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

    const subscription = client.subscriptions.get(guild.id);
    if (subscription) {
      const onTimeout = async () => {
        subscription.connection?.disconnect();
        await interaction.channel?.send({ embeds: [notrack("Disconnected due to inactivity!")] });
      };
      const newTimer = setTimeout(onTimeout, INACTIVITY_TIMEOUT);
      client.timers.set(guild.id, newTimer);
    }
  };

  // Define listener functions
  const clearSubscription = async () => {
    const subscription = client.subscriptions.get(guild.id);
    if (subscription) {
      subscription.player.removeAllListeners();
      subscription.player.stop();
      subscription.unsubscribe();
      client.subscriptions.delete(guild.id);
      client.currentSongs.delete(guild.id);
    }
    consola.info("Disconnected due to inactivity!");
  };
  const onError = (error: Error) => {
    clearSubscription();
    consola.error(error);
  };

  const onPlayerIdle = async () => {
    const subscription = client.subscriptions.get(guild.id);
    if (!subscription) return;

    const currentSong = client.currentSongs.get(guild.id);
    if (!currentSong) return;

    const nextSong = await getNextSong(guild.id, currentSong?.id!);
    if (!nextSong) {
      startTimeout();
      clearSubscription();
      await interaction.channel?.send({ embeds: [notrack("No more songs in queue!")] });
      consola.info("No more songs to play!");
      return;
    }
    stopTimeout();
    const audiostream = await stream(nextSong.url, { quality: 2 });
    const resource = createAudioResource(audiostream.stream, {
      inputType: audiostream.type,
      inlineVolume: true,
    });
    subscription.player.play(resource);
    client.currentSongs.set(guild.id, nextSong);
    await interaction.channel?.send({ embeds: [track(nextSong)] });
    consola.info("Playing next song!");
  };

  const song = interaction.options.get("song", true).value;
  if (typeof song !== "string") throw new Error("There was an error while reading your song name!");

  const subscription = client.subscriptions.get(guild.id);
  if (!subscription) {
    stopTimeout();
    const connection = joinVoiceChannel(connectionOptions);
    connection.on(VoiceConnectionStatus.Disconnected, clearSubscription);
    connection.on(VoiceConnectionStatus.Destroyed, clearSubscription);
    connection.on("error", onError);

    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
    const newSubscription = connection.subscribe(player)!;

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
      inlineVolume: true,
    });
    player.play(resource);
    player.on(AudioPlayerStatus.Idle, onPlayerIdle);
    client.currentSongs.set(guild.id, currentSong);
    client.subscriptions.set(guild.id, newSubscription);

    await interaction.followUp({ embeds: [track(currentSong)] });
  } else {
    const connection = getVoiceConnection(guild.id);
    if (connection?.joinConfig.channelId != channel.id)
      throw new Error("You must be in the same voice channel as the bot to play a song!");
    await addSongToQueue(song, interaction, client);
  }
};
