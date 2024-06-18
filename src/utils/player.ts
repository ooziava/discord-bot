import consola from "consola";
import {
  entersState,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  type AudioPlayer,
  AudioPlayerError,
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
  const idleHandler = async () => {
    const meta = await GuildService.getPlayerMeta(guildId);
    const shouldPlayNext = meta.loop || meta.outsideQ;

    if (shouldPlayNext) {
      await GuildService.playNext(guildId);
    } else if (meta.outsideQ) {
      await GuildService.setOutsideQ(guildId, false);
    }

    const song = await GuildService.getCurrentSong(guildId);
    if (!song) return;

    await playSong(newPlayer, song, meta.volume);
  };
  const errorHandler = async (error: AudioPlayerError) => {
    consola.error("Audio player error: ", error);
    try {
      await idleHandler();
    } catch (error) {
      consola.error("Failed to play next song: ", error);
    }
  };

  newPlayer.on("error", errorHandler);
  newPlayer.on(AudioPlayerStatus.Idle, idleHandler);
  return newPlayer;
}

export async function playSong(player: AudioPlayer, song: NewSong, volume: number) {
  const play = async () => {
    const st = await stream(song.url, {
      quality: 2,
      discordPlayerCompatibility: song.duration < 600_000,
    });

    const resource = createAudioResource(st.stream, {
      inputType: st.type,
      inlineVolume: true,
    });

    resource.volume?.setVolume(volume / 100);
    player.play(resource);
    return await entersState(player, AudioPlayerStatus.Playing, 5000);
  };

  try {
    return await play();
  } catch (error) {
    consola.log("Song obj: ", song);
    consola.error("Failed to play current song: ", error);
    let retries = 0;
    while (retries < 3) {
      retries++;
      consola.info(`Retrying to play song...`);
      try {
        return await play();
      } catch (error) {
        consola.error(error);
      }
    }
    throw error;
  }
}
