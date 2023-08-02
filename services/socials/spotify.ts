import { Song } from "interfaces/discordjs.js";
import { spotify, SpotifyPlaylist } from "play-dl";

export default async (query: string): Promise<Song[]> => {
  const res = await spotify(query);

  if (res.type === "playlist")
    return (await (res as SpotifyPlaylist).all_tracks()).map((track) => ({
      url: track.url,
      title: track.name,
      thumbnail: track.thumbnail?.url ?? "",
      duration: track.durationInSec,
    }));
  else if (res.type === "track")
    return [
      {
        url: res.url,
        title: res.name,
        thumbnail: res.thumbnail?.url ?? "",
        duration: 0,
      },
    ];
  else throw new Error("Video not found!");
};
