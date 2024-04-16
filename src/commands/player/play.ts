import { SlashCommandBuilder, Message, type VoiceBasedChannel, GuildMember } from "discord.js";
import type { Data, Execute } from "../../types/command.js";
import {
  AudioPlayer,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from "@discordjs/voice";
import { stream, validate } from "play-dl";
import type { ISong, NewSong } from "../../types/song.js";
import GuildService from "../../services/guild.js";
import reply from "../../utils/reply.js";
import SearchService from "../../services/search.js";
import SongService from "../../services/song.js";
import type MyClient from "../../client.js";
import { SourceEnum } from "../../types/source.js";

export const data: Data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) => option.setName("url").setDescription("The URL of the song to play"));

export const execute: Execute = async (client, interaction, args) => {
  const url = interaction instanceof Message ? args?.[0] : interaction.options.getString("url");

  const member = interaction.member;
  // if (!(interaction instanceof Message)) await interaction.deferReply();
  if (member instanceof GuildMember && member.voice.channel) {
    let song;
    if (!url) {
      song = await GuildService.getCurrentSong(interaction.guildId);

      if (!song) return await reply(interaction, "No song in queue");
      else await reply(interaction, "Playing last song in queue");
    } else {
      await reply(interaction, "Searching for song...");

      const result = await validate(url).catch(() => null);
      const source = result && result.includes("sp_") ? SourceEnum.Spotify : SourceEnum.Youtube;
      const video = await SearchService.getSongByURL(url, { source });
      if (!video) return await reply(interaction, "Song not found");
      song = SongService.parseYoutubeVideo(video);
    }
    // already replied now

    const channel = member.voice.channel;
    let player = client.players.get(interaction.guildId);

    try {
      const connection = await connectToChannel(channel);
      const guild = await GuildService.getGuild(interaction.guildId);
      if (!player) {
        player = createPlayer(interaction.guildId);
        client.players.set(interaction.guildId, player);

        connection.subscribe(player);
        await playSong(player, song, guild.volume);
      } else {
        if (url) {
          const newPlayer = createPlayer(interaction.guildId);
          connection.subscribe(newPlayer);
          player.stop();
          player = newPlayer;
          client.players.set(interaction.guildId, player);
          await playSong(player, song, guild.volume);
        } else {
          const state = player.state.status;
          if (state !== AudioPlayerStatus.Idle) {
            return await reply(interaction, "Player is already playing");
          } else {
            player.emit("idle");
          }
        }
      }

      return await reply(interaction, `Now playing: ${song.title}`);
    } catch (error) {
      console.error(error);
      return await reply(interaction, "Failed to play song");
    }
  } else {
    return await reply(interaction, "You need to be in a voice channel to play a song");
  }
};

function createPlayer(guildId: string) {
  const newPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  newPlayer.on("error", console.error);

  newPlayer.on(AudioPlayerStatus.Idle, async () => {
    await GuildService.playNext(guildId);
    const song = await GuildService.getCurrentSong(guildId);

    if (song) {
      const guild = await GuildService.getGuild(guildId);
      await playSong(newPlayer, song, guild.volume);
    }
  });
  return newPlayer;
}

async function playSong(player: AudioPlayer, song: NewSong, volume: number) {
  const st = await stream(song.url);
  const resource = createAudioResource(st.stream, {
    inputType: st.type,
    inlineVolume: true,
  });

  resource.volume?.setVolume(volume / 100);
  player.play(resource);
  return entersState(player, AudioPlayerStatus.Playing, 5000);
}

async function connectToChannel(channel: VoiceBasedChannel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch (error) {
      try {
        connection.destroy();
      } catch (error) {}
    }
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    return connection;
  } catch (error) {
    connection.destroy();
    throw error;
  }
}
