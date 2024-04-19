import { SpotifyAlbum, validate, YouTubePlayList } from "play-dl";

import {
  SongService,
  GuildService,
  SearchService,
  PlaylistService,
} from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import { type MyCommandInteraction, SourceEnum } from "../../../types/index.js";
import { getPlaylistSource } from "../../../utils/urls.js";

export default async function addPlaylist(interaction: MyCommandInteraction, input: string) {
  const storedPlaylist = await PlaylistService.getByUrl(input);
  if (storedPlaylist) {
    if (await GuildService.hasPlaylist(interaction.guildId, storedPlaylist._id))
      return await reply(interaction, "Playlist already saved.");
    else {
      await GuildService.addPlaylist(interaction.guildId, storedPlaylist._id);
      return await reply(interaction, `Playlist saved: ${storedPlaylist.name}`);
    }
  }

  let source = await getPlaylistSource(input);
  const playlist = await SearchService.getPlaylistByURL(input, { source });
  if (!playlist) return await reply(interaction, "Playlist not found.");

  const { info, videos } = playlist;
  if (!videos) return await reply(interaction, "Failed to fetch playlist videos.");

  const newPlaylist =
    info instanceof YouTubePlayList
      ? PlaylistService.parseYoutubePlaylist(info)
      : info instanceof SpotifyAlbum
      ? PlaylistService.parseSpotifyAlbum(info)
      : PlaylistService.parseSpotifyPlaylist(info);

  for (const video of videos) {
    const song = SongService.parseYoutubeVideo(video);
    const newSong = (await SongService.getByUrl(song.url)) || (await SongService.save(song));
    newPlaylist.songs.push(newSong._id);
  }

  const savedPlaylist = await PlaylistService.save(newPlaylist);
  await GuildService.addPlaylist(interaction.guildId, savedPlaylist._id);
  return await reply(interaction, `Playlist saved: ${savedPlaylist.name}`);
}
