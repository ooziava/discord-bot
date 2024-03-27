import { type SoundCloudTrack, search, validate, SpotifyTrack } from "play-dl";

export const validateQuery = async (query: string): Promise<[string, string] | undefined> => {
  const res = await validate(query);
  if (res) return res.split("_") as [string, string];
};

export const searchYtVideo = async (query: string): Promise<Video[]> => {
  return await search(query, { limit: 10, source: { youtube: "video" } });
};

export const parseYtPlaylistUrl = (url: string): string => {
  const parsedUrl = new URL(url);
  const playlistId = parsedUrl.searchParams.get("list");
  if (!playlistId) throw new Error("There was an error while reading your playlist ID!");
  return "https://music.youtube.com/playlist?list=" + playlistId;
};

export const createStoredSongByVideo = (
  song: Video,
  username?: string,
  userThumbnail?: string | null
): StoredSong => ({
  url: song.url,
  title: song.title ?? "Unknown title",
  duration: song.durationInSec ?? 0,
  timestamp: new Date().getTime(),
  author: {
    url: song.channel?.url ?? "https://www.youtube.com/",
    name: song.channel?.name ?? "Unknown author",
    thumbnail: song.channel?.iconURL() ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  },
  user: {
    name: username ?? "Anonymous",
    thumbnail: userThumbnail ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  },
  thumbnail:
    song.thumbnails && song.thumbnails[0]
      ? song.thumbnails[0].url
      : "https://cdn.discordapp.com/embed/avatars/0.png",
  playlist: song.playlist,
});

export const createStoredSongBySoTrack = (
  track: SoundCloudTrack,
  username?: string,
  userThumbnail?: string | null
): StoredSong => ({
  url: track.url,
  title: track.name ?? "Unknown title",
  duration: track.durationInSec ?? 0,
  timestamp: new Date().getTime(),
  thumbnail: track.thumbnail ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  author: {
    url: track.user.url ?? "https://soundcloud.com/",
    name: track.user.full_name ?? "Unknown author",
    thumbnail: track.user.thumbnail ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  },
  user: {
    name: username ?? "Anonymous",
    thumbnail: userThumbnail ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  },
});

export const createStoredSongBySpTrack = (
  track: SpotifyTrack,
  username?: string,
  userThumbnail?: string | null,
  playlist?: {
    title: string;
    url: string;
    thumbnail: string;
  }
): StoredSong => ({
  url: track.url,
  title: track.name ?? "Unknown title",
  duration: track.durationInSec ?? 0,
  timestamp: new Date().getTime(),
  thumbnail: track.thumbnail?.url ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  author: {
    url: track.artists[0].url ?? "https://open.spotify.com/",
    name: track.artists[0].name ?? "Unknown author",
    thumbnail: "https://cdn.discordapp.com/embed/avatars/0.png",
  },
  user: {
    name: username ?? "Anonymous",
    thumbnail: userThumbnail ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  },
  playlist: playlist,
});
