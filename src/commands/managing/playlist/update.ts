import { SpotifyAlbum, YouTubePlayList } from "play-dl";
import { PlaylistService, SearchService, SongService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import type { MyCommandInteraction } from "../../../types/command.js";
import { Message } from "discord.js";

export default async function updatePlaylist(interaction: MyCommandInteraction, query: string) {
  const playlist = await PlaylistService.getByNameOrUrl(query);
  if (!playlist) {
    await reply(interaction, "Playlist not found.");
    return;
  }

  if (!(interaction instanceof Message)) await interaction.deferReply();
  else await reply(interaction, "Fetching playlist...");

  const response = await SearchService.getPlaylistByURL(playlist.url);
  if (!response) {
    await reply(interaction, "The playlist is not available anymore.");
    return;
  }

  const { info, videos } = response;
  const newPlaylist =
    info instanceof YouTubePlayList
      ? PlaylistService.parseYoutubePlaylist(info)
      : info instanceof SpotifyAlbum
      ? PlaylistService.parseSpotifyAlbum(info)
      : PlaylistService.parseSpotifyPlaylist(info);

  for (const video of videos) {
    const song = SongService.parseYoutubeVideo(video);
    const newSong = (await SongService.isExist(song.url)) || (await SongService.save(song));
    newPlaylist.songs.push(newSong._id);
  }
  await PlaylistService.update(playlist._id, newPlaylist);
  await reply(interaction, `Playlist updated: ${playlist.name}`);
}
