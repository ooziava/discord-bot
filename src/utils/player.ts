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

export function createPlayer(guildId: string) {
  const newPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  newPlayer.on("error", console.error);

  newPlayer.on(AudioPlayerStatus.Idle, async () => {
    const guild = await GuildService.getGuild(guildId);
    if (!guild.loop) await GuildService.playNext(guildId);
    const song = await GuildService.getCurrentSong(guildId);

    if (song) {
      await playSong(newPlayer, song, guild.volume);
    }
  });
  return newPlayer;
}

export async function playSong(player: AudioPlayer, song: NewSong, volume: number) {
  const st = await stream(song.url).catch(() => null);
  if (!st) return player.emit("idle");

  const resource = createAudioResource(st.stream, {
    inputType: st.type,
    inlineVolume: true,
  });

  resource.volume?.setVolume(volume / 100);
  player.play(resource);
  return entersState(player, AudioPlayerStatus.Playing, 5000);
}
