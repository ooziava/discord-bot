import { type YouTubeVideo, search, validate } from "play-dl";

export const getType = async (query: string): Promise<[string, string] | false> => {
  const res = await validate(query);
  return res ? (res.split("_") as [string, string]) : false;
};

export const searchYtVideo = async (query: string): Promise<Track | undefined> => {
  const results = await search(query, { limit: 1, source: { youtube: "video" } });
  return results[0];
};

export const trackToSong = (track: Track, username?: string, usertthumbnail?: string): Song => ({
  title: track.title ?? "Unknown title",
  timestamp: new Date().getTime(),
  url: track.url,
  thumbnail:
    track.thumbnails && track.thumbnails[0]
      ? track.thumbnails[0].url
      : "https://cdn.discordapp.com/embed/avatars/0.png",
  duration: track.durationInSec ?? 0,
  user: {
    name: username ?? "Anonymous",
    thumbnail: usertthumbnail ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  },
  author: {
    name: track.channel?.name ?? "Unknown author",
    url: track.channel?.url ?? "",
    thumbnail: track.channel?.iconURL() ?? "https://cdn.discordapp.com/embed/avatars/0.png",
  },
  playlist: track.playlist ?? undefined,
});
