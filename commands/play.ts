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
  const channel = (interaction.member as GuildMember)?.voice.channel;
  if (!channel) throw new Error("You must be in a voice channel to play a song!");

  const guild = interaction.guild;
  if (!guild) throw new Error("There was an error while reading your guild ID!");

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

  if (connection.joinConfig.channelId !== channel.id)
    throw new Error("You must be in the same voice channel as the bot to play a song!");

  const song = interaction.options.get("song", true).value;
  if (typeof song !== "string") throw new Error("There was an error while reading your song name!");

  let subscription = client.subscriptions.get(guild.id);
  let currentSong: StoredSong | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const startTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      if (connection) {
        connection.disconnect();
        interaction.followUp({ embeds: [notrack("Disconnected due to inactivity!")] });
      }
    }, INACTIVITY_TIMEOUT);
  };

  const stopTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  if (!subscription) {
    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
    subscription = connection.subscribe(player)!;
    client.subscriptions.set(guild.id, subscription);
    currentSong = await getSong(guild.id, 0);

    const onIdle = async () => {
      startTimeout();
      const nextSong = await getNextSong(guild.id, currentSong?.id!);
      if (!nextSong) {
        consola.info("No more songs to play!");
        // player.removeListener(AudioPlayerStatus.Idle, onIdle);
        return await interaction.channel?.send({ embeds: [notrack("No more songs in queue!")] });
      }
      currentSong = nextSong;
      const audiostream = await stream(nextSong.url, { quality: 2 });
      const resource = createAudioResource(audiostream.stream, {
        inputType: audiostream.type,
        inlineVolume: true,
      });
      player.play(resource);
      consola.info("Playing next song!");
      await interaction.channel?.send({ embeds: [track(nextSong)] });
    };
    const onStateChange = (oldState: AudioPlayerState, newState: AudioPlayerState) => {
      if (newState.status === AudioPlayerStatus.Playing) {
        stopTimeout();
      }
    };
    player.on(AudioPlayerStatus.Idle, onIdle);
    player.on(AudioPlayerStatus.Playing, onStateChange);
  }
  if (subscription.player.state.status === AudioPlayerStatus.Playing)
    return await addSongToQueue(song, interaction, client);

  await interaction.deferReply();
  await interaction.editReply({ embeds: [notrack("Searching for your song...")] });

  if (is_expired()) await refreshToken();
  await clearSongs(guild.id);
  await addSongToQueue(song, interaction, client);
  currentSong = await getSong(guild.id, 0);
  if (!currentSong) throw new Error("There was an error while reading your song!");

  const audiostream = await stream(currentSong.url, { quality: 2 });
  const resource = createAudioResource(audiostream.stream, {
    inputType: audiostream.type,
    inlineVolume: true,
  });
  subscription.player.play(resource);

  await interaction.followUp({ embeds: [track(currentSong)] });
};
