import {
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  type CommandInteraction,
} from "discord.js";
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
import trackSelect from "../components/track-select.js";
import { add, cancel } from "../components/buttons.js";

export const addSongToQueue = async (
  songName: string,
  interaction: CommandInteraction,
  client: MyClient
) => {
  if (!interaction.replied && !interaction.deferred) await interaction.deferReply();

  const notrackReply = { embeds: [notrack("No results found!")] };
  let message = "Song added to queue!";
  const qInfo = await validateQuery(songName);
  if (!qInfo) return await interaction.editReply(notrackReply);

  const [social, type] = qInfo;
  switch (social) {
    case "search":
      consola.info("Searching for song on YouTube...");
      const ytSongs = await searchYtVideo(songName);
      if (!ytSongs) return await interaction.editReply(notrackReply);
      else {
        const response = await interaction.editReply({
          content: "Select a song from the list below:",
          components: [trackSelect(ytSongs)],
          embeds: [],
        });
        const collectorFilter = (i: any) => i.user.id === interaction.user.id;
        try {
          let selectedKeys: number[] = [];
          const collector = response.createMessageComponentCollector({
            filter: collectorFilter,
            componentType: ComponentType.StringSelect,
            time: 60_000,
          });
          collector.on("collect", (i) => {
            selectedKeys = i.values.map((value: string) => parseInt(value.split("-")[1]));
            i.deferUpdate();
          });

          await response.awaitMessageComponent({
            filter: collectorFilter,
            time: 60_000,
          });
          collector.stop();

          const selectedSongs: Video[] = [];
          selectedKeys.forEach((key) => selectedSongs.push(ytSongs[key]));
          const storedSongs = selectedSongs.map((song) =>
            createStoredSongByVideo(song, interaction.user.username, interaction.user.avatarURL())
          );
          await saveSongs(interaction.guildId!, storedSongs);
        } catch (e) {
          await interaction.editReply({
            content: "Confirmation not received within 1 minute, cancelling",
            components: [],
          });
        }
      }
      break;

    case "yt":
      consola.info("Searching on YouTube...");
      const videos = await getYt(songName, type as YouTubeType);
      if (!videos || !videos.length) return await interaction.editReply(notrackReply);
      const songs = videos.map((video) =>
        createStoredSongByVideo(video, interaction.user.username, interaction.user.avatarURL())
      );
      await saveSongs(interaction.guildId!, songs);
      if (songs[0].playlist)
        message = `${songs.length} songs from ${songs[0].playlist.title} playlist added to queue!`;
      else if (songs.length > 1) message = `${songs.length} songs added to queue!`;
      break;

    case "so":
      consola.info("Searching on SoundCloud...");
      const [track] = await getSoundlcoud(songName, type as SpotifyType);
      if (!track) return await interaction.editReply(notrackReply);
      const soStoredSong = createStoredSongBySoTrack(
        track,
        interaction.user.username,
        interaction.user.avatarURL()
      );
      await saveSongs(interaction.guildId!, [soStoredSong]);
      break;

    case "sp":
      consola.info("Searching on Spotify...");
      const spTracks = await getSpotify(songName, type as SpotifyType);
      if (!spTracks || !spTracks.length) return await interaction.editReply(notrackReply);
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
      await saveSongs(interaction.guildId!, spSongs);
      if (spSongs[0].playlist)
        message = `${spSongs.length} songs from ${spSongs[0].playlist.title} playlist added to queue!`;
      else if (spSongs.length > 1) message = `${spSongs.length} songs added to queue!`;
      break;
  }

  await interaction.editReply({ embeds: [notrack(message)], components: [], content: null });
};
