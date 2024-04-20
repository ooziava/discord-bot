import consola from "consola";
import {
  entersState,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  type AudioPlayer,
} from "@discordjs/voice";
import { stream } from "play-dl";

import GuildService from "../services/guild.js";

import type { ISong, NewSong } from "../types/song.js";
import SongService from "../services/song.js";

export function createPlayer(guildId: string) {
  const newPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  newPlayer.on("error", consola.error);

  newPlayer.on(AudioPlayerStatus.Idle, async () => {
    const guild = await GuildService.playNext(guildId);
    if (guild.queue.length > 0) {
      const song = await SongService.getById(guild.queue[0]._id.toString());
      if (!song) {
        newPlayer.emit("idle");
        return;
      }
      await playSong(newPlayer, song, guild.volume);
    }
  });
  return newPlayer;
}

export async function playSong(player: AudioPlayer, song: NewSong, volume: number) {
  const st = await stream(song.url, {
    quality: 2,
    discordPlayerCompatibility: song.duration < 600_000,
  }).catch(consola.error);

  if (!st) {
    player.emit("idle");
    return;
  }

  const resource = createAudioResource(st.stream, {
    inputType: st.type,
    inlineVolume: true,
  });

  resource.volume?.setVolume(volume / 100);
  player.play(resource);
  return await entersState(player, AudioPlayerStatus.Playing, 5000);
}
