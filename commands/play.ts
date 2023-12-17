import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { SlashCommandBuilder } from "discord.js";
import { GuildMember } from "discord.js";
import { addSongToQueue } from "../services/add-song.js";
import { clearSongs, getNextSong, getSong } from "../utils/mongo.js";
import { is_expired, refreshToken, stream } from "play-dl";
import consola from "consola";
import track from "../components/track.js";
import notrack from "../components/notrack.js";

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

  const connection =
    getVoiceConnection(guild.id) ??
    joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild?.voiceAdapterCreator!,
    });

  if (connection.joinConfig.channelId !== channel.id)
    throw new Error("You must be in the same voice channel as the bot to play a song!");

  const song = interaction.options.get("song", true).value;
  if (typeof song !== "string") throw new Error("There was an error while reading your song name!");

  let subscription = client.subscriptions.get(guild.id);
  let currentSong = await getSong(guild.id, 0);
  if (!subscription) {
    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
    subscription = connection.subscribe(player)!;
    client.subscriptions.set(guild.id, subscription);

    const onIdle = async () => {
      currentSong = await getNextSong(guild.id, currentSong?.id!);
      if (!currentSong) {
        consola.info("No more songs to play!");
        // player.removeListener(AudioPlayerStatus.Idle, onIdle);
        return await interaction.followUp({ embeds: [notrack()] });
      }
      consola.info("Playing next song!");
      const audiostream = await stream(currentSong.url, { quality: 2 });
      const resource = createAudioResource(audiostream.stream, {
        inputType: audiostream.type,
        inlineVolume: true,
      });
      player.play(resource);
      await interaction.followUp({ embeds: [track(currentSong)] });
    };
    player.on(AudioPlayerStatus.Idle, onIdle);
  }
  if (subscription.player.state.status === AudioPlayerStatus.Playing)
    return await addSongToQueue(song, interaction, client);

  await interaction.deferReply();
  await interaction.editReply("Searching for song...");

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
