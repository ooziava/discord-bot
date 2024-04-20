import { SpotifyAlbum, YouTubePlayList } from "play-dl";

import {
  SongService,
  GuildService,
  SearchService,
  PlaylistService,
} from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import { type MyCommandInteraction } from "../../../types/index.js";
import { Message } from "discord.js";

export default async function addPlaylist(interaction: MyCommandInteraction, url: string) {
  const storedPlaylist = await PlaylistService.isExists(url);
  if (storedPlaylist) {
    if (await GuildService.hasPlaylist(interaction.guildId, storedPlaylist._id)) {
      await reply(interaction, "Playlist already saved.");
      return;
    } else {
      await GuildService.addPlaylist(interaction.guildId, storedPlaylist._id);
      await reply(interaction, "Playlist saved");
      return;
    }
  }

  if (!(interaction instanceof Message)) await interaction.deferReply();
  else await reply(interaction, "Fetching playlist...");

  const playlist = await SearchService.getPlaylistByURL(url);
  if (!playlist) {
    await reply(interaction, "Playlist not found.");
    return;
  }

  const { info, videos } = playlist;
  if (!videos) {
    await reply(interaction, "Failed to fetch playlist videos.");
    return;
  }

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

  const savedPlaylist = await PlaylistService.save(newPlaylist);
  await GuildService.addPlaylist(interaction.guildId, savedPlaylist._id);
  await reply(interaction, `Playlist saved: ${savedPlaylist.name}`);
}
