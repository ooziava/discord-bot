import type { CommandInteraction } from "discord.js";
import consola from "consola";
import {
  createStoredSongBySoTrack,
  createStoredSongBySpTrack,
  createStoredSongByVideo,
  searchYtVideo,
  validateQuery,
} from "../utils/play-dl.js";
import { saveSongs } from "../utils/mongo.js";
import getYt from "./youtube.js";
import getSoundlcoud from "./soundcloud.js";
import getSpotify from "./spotify.js";
import notrack from "../components/notrack.js";

export const addSongToQueue = async (
  songName: string,
  interaction: CommandInteraction,
  client: MyClient
) => {
  consola.info("Starting to search for song...");
  if (!interaction.replied && !interaction.deferred) await interaction.deferReply();

  consola.info("Validating query...");
  const qInfo = await validateQuery(songName);
  if (!qInfo) return await interaction.editReply({ embeds: [notrack("No results found!")] });
  const [social, type] = qInfo;

  switch (social) {
    case "search":
      consola.info("Searching for song on YouTube...");
      const song = await searchYtVideo(songName);
      if (!song) return await interaction.editReply({ embeds: [notrack("No results found!")] });
      const storedSong = createStoredSongByVideo(
        song,
        interaction.user.username,
        interaction.user.avatarURL()
      );

      consola.info("Saving song to database...");
      await saveSongs(interaction.guildId!, [storedSong]);
      break;

    case "yt":
      consola.info("Searching on YouTube...");
      const videos = await getYt(songName, type as YouTubeType);
      if (!videos || !videos.length)
        return await interaction.editReply({ embeds: [notrack("No results found!")] });
      const songs = videos.map((video) =>
        createStoredSongByVideo(video, interaction.user.username, interaction.user.avatarURL())
      );

      consola.info(`Saving ${songs.length > 1 ? "playlist" : "song"} to database...`);
      await saveSongs(interaction.guildId!, songs);
      break;

    case "so":
      consola.info("Searching on SoundCloud...");
      const [track] = await getSoundlcoud(songName, type as SpotifyType);
      if (!track) return await interaction.editReply({ embeds: [notrack("No results found!")] });
      const soStoredSong = createStoredSongBySoTrack(
        track,
        interaction.user.username,
        interaction.user.avatarURL()
      );

      consola.info("Saving song to database...");
      await saveSongs(interaction.guildId!, [soStoredSong]);
      break;

    case "sp":
      consola.info("Searching on Spotify...");
      const spTracks = await getSpotify(songName, type as SpotifyType);
      if (!spTracks || !spTracks.length)
        return await interaction.editReply({ embeds: [notrack("No results found!")] });
      // const spSongs = spTracks.map(({ track, playlist }) =>
      //   createStoredSongBySpTrack(
      //     track,
      //     interaction.user.username,
      //     interaction.user.avatarURL(),
      //     playlist
      //   )
      // );
      const spSongs = spTracks.map((track) =>
        createStoredSongByVideo(track, interaction.user.username, interaction.user.avatarURL())
      );

      consola.info(`Saving ${spSongs.length > 1 ? "playlist" : "song"} to database...`);
      await saveSongs(interaction.guildId!, spSongs);
      break;
  }

  await interaction.editReply({ embeds: [notrack("Song added to queue!")] });
};
