import consola from "consola";
import {
  type GuildMember,
  type CommandInteractionOptionResolver,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import {
  joinVoiceChannel,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { stream, is_expired, refreshToken } from "play-dl";

import getYt from "../search/youtube.js";
import EmbedTrack from "../embeds/track.js";
import EmbedNoTrack from "../embeds/notrack.js";
import EmbedNewSong from "../embeds/newsong.js";
import getYtFromSpotify from "../search/spotify.js";
import { getLength, getNextSong, saveSongs } from "../mongo.js";
import { getType, searchYtVideo, trackToSong } from "../utils/play-dl.js";

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Plays a song")
  .addStringOption((option) =>
    option.setName("song").setDescription("The song to play").setRequired(true)
  );

export const execute: Execute = async (interaction, client) => {
  await interaction.deferReply();
  if (is_expired()) await refreshToken();

  const query = (interaction.options as CommandInteractionOptionResolver).getString("song")!;
  let tracks: Track[] = [];

  try {
    const qtype = await getType(query);
    if (!qtype) {
      await interaction.followUp({
        content: "Invalid song!",
        ephemeral: true,
      });
      return;
    }

    const [social, type] = qtype;
    if (type === "search" || social === "search") {
      const track = await searchYtVideo(query);
      tracks = track ? [track] : [];
    } else if (social === "sp") tracks = await getYtFromSpotify(query, type as SpotifyType);
    else if (social === "yt") tracks = await getYt(query, type as YouTubeType);
    else {
      await interaction.followUp({
        content: "Invalid request!",
        ephemeral: true,
      });
      return;
    }
  } catch (error) {
    consola.error(error);
    await interaction.followUp({
      content: "Error while searching for song!",
      ephemeral: true,
    });
    return;
  }

  const songs = tracks
    .filter((track) => track && track.url)
    .map((track) =>
      trackToSong(track, interaction.user.username, interaction.user.displayAvatarURL())
    );

  if (!songs.length) {
    await interaction.followUp({
      content: "No results found!",
      ephemeral: true,
    });
    return;
  }
  const length = await getLength(interaction.guildId!);
  try {
    await saveSongs(songs, interaction.guildId!);
  } catch (error) {
    consola.error(error);
    await interaction.followUp({
      content: "Error while saving song!",
      ephemeral: true,
    });
    return;
  }

  const onDisconnect = async () => {
    const sub = client.subscriptions.get(interaction.guildId!);
    if (sub) {
      sub.unsubscribe();
      sub.player.stop();
      client.subscriptions.delete(interaction.guildId!);
      await interaction.deleteReply().catch(() => consola.info("No reply to delete"));
    }
  };

  const onPlayerIdle = async () => {
    const sub = client.subscriptions.get(interaction.guildId!);
    consola.info("Player idle");
    if (sub) {
      const id = client.songs.get(interaction.guildId!)?.id;
      const length = await getLength(interaction.guildId!);
      const song = await getNextSong(interaction.guildId!, id || length - 1);
      if (song) {
        consola.info("Now playing next song");
        const audiostream = await stream(song.url, { quality: 2 });
        const resource = createAudioResource(audiostream.stream, {
          inputType: audiostream.type,
          inlineVolume: true,
        });
        sub.player.play(resource);
        client.songs.set(interaction.guildId!, song);

        const next = await getNextSong(interaction.guildId!, song.id!);
        await interaction.editReply({
          embeds: [EmbedTrack(song, next)],
        });
        return;
      } else {
        sub.unsubscribe();
        sub.player.stop();
        client.subscriptions.delete(interaction.guildId!);
        await interaction.editReply({
          embeds: [EmbedNoTrack()],
        });
        return;
      }
    }
  };

  const member = interaction.member as GuildMember;
  if (!member.voice.channelId) {
    await interaction.followUp({
      content: "You must be in a voice channel!",
      ephemeral: true,
    });
    return;
  }
  const subscription = client.subscriptions.get(interaction.guildId!);

  if (subscription) {
    await interaction.followUp({
      embeds: [EmbedNewSong(songs[0])],
      ephemeral: true,
    });
    return;
  }

  const [first] = songs;
  first.id = length;
  client.songs.set(interaction.guildId!, first);

  const connection = joinVoiceChannel({
    channelId: member.voice.channelId,
    guildId: interaction.guildId!,
    adapterCreator: interaction.guild!.voiceAdapterCreator,
  });
  const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });

  connection.on(VoiceConnectionStatus.Disconnected, onDisconnect);
  player.on(AudioPlayerStatus.Idle, onPlayerIdle);

  const sub = connection.subscribe(player)!;
  client.subscriptions.set(interaction.guildId!, sub);

  try {
    const audiostream = await stream(songs[0]!.url, { quality: 2 });
    consola.info("Now player started");
    const resource = createAudioResource(audiostream.stream, {
      inputType: audiostream.type,
      inlineVolume: true,
    });
    player.play(resource);
  } catch (error) {
    consola.error(error);
    await interaction.followUp({
      content: "Error while playing song!",
      ephemeral: true,
    });
    return;
  }
  const track = client.songs.get(interaction.guildId!)!;
  await interaction.followUp({
    embeds: [EmbedTrack(track)],
  });
};
