import consola from "consola";
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import {
  CommandInteractionOptionResolver,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { stream, is_expired, refreshToken, YouTubeVideo } from "play-dl";

import { getType, searchYtVideo, trackToSong } from "../utils/play-dl.js";
import getYtFromSpotify from "../search/spotify.js";
import getYt from "../search/youtube.js";
import { getLength, getNextSong, saveSongs } from "../mongo.js";

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

    if (type === "search") {
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
  try {
    const length = await getLength(interaction.guildId!);
    const [first] = songs;
    first.id = length;
    client.songs.set(interaction.guildId!, first);
    saveSongs(songs, interaction.guildId!);
  } catch (error) {
    consola.error(error);
    await interaction.followUp({
      content: "Error while saving song!",
      ephemeral: true,
    });
    return;
  }
  const member = interaction.member as GuildMember;
  if (!member.voice.channelId) {
    await interaction.followUp({
      content: "You must be in a voice channel!",
      ephemeral: true,
    });
    return;
  }
  const subscription = client.subscriptions.get(interaction.guildId!);

  const onDisconnect = () => {
    const sub = client.subscriptions.get(interaction.guildId!);
    if (sub) {
      sub.unsubscribe();
      sub.player.stop();
      client.subscriptions.delete(interaction.guildId!);
    }
  };

  const onPlayerIdle = async () => {
    const sub = client.subscriptions.get(interaction.guildId!);
    consola.info("Player idle");
    if (sub) {
      const id = client.songs.get(interaction.guildId!)?.id;
      const song = await getNextSong(interaction.guildId!, id || 0);
      if (song) {
        const audiostream = await stream(song.url, { quality: 2 });
        const resource = createAudioResource(audiostream.stream, {
          inputType: audiostream.type,
          inlineVolume: true,
        });
        sub.player.play(resource);
        client.songs.set(interaction.guildId!, song);

        await interaction.followUp({
          content: `Now playing ${song.title} [one of ${songs.length}]`,
        });
        return;
      } else {
        sub.unsubscribe();
        sub.player.stop();
        client.subscriptions.delete(interaction.guildId!);
        await interaction.followUp({
          content: "No more songs in queue!",
        });
        return;
      }
    }
  };

  if (!subscription) {
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
  }

  const player = client.subscriptions.get(interaction.guildId!)!.player;

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
    embeds: [
      new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(track.title)
        .setURL(track.url)
        .setAuthor({
          name: track.author.name,
          iconURL: track.author.thumbnail,
          url: track.author.url,
        })
        .setDescription("Some description here")
        .setThumbnail(track.thumbnail)
        .setTimestamp(track.timestamp)
        .setFooter({ text: `Added by ${track.user.name}`, iconURL: track.user.thumbnail }),
    ],
  });
};
