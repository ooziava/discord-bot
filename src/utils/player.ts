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

import type { NewSong } from "../types/song.js";
import SongService from "../services/song.js";

export function createPlayer(guildId: string) {
  const newPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  newPlayer.on("error", consola.error);

  newPlayer.on(AudioPlayerStatus.Idle, async () => {
    try {
      const meta = await GuildService.getPlayerMeta(guildId);
      if (!meta.loop) {
        await GuildService.playNext(guildId);
      }
      const song = await GuildService.getCurrentSong(guildId);
      if (!song) {
        newPlayer.emit("idle");
        return;
      }
      try {
        await playSong(newPlayer, song, meta.volume);
      } catch (error) {
        consola.error("Failed to play current song: ", error);
        newPlayer.emit("idle");
      }
    } catch (error) {
      consola.error("Failed to play next song: ", error);
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
