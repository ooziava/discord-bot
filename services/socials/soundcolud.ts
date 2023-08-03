import { Song } from "interfaces/discordjs";
import { soundcloud, SoundCloudPlaylist } from "play-dl";

export default async (query: string): Promise<Song[]> => {
  const res = await soundcloud(query);

  if (res.type === "playlist") {
    const tracks = await (res as SoundCloudPlaylist).all_tracks();
    return tracks.map((track) => ({
      url: track.url,
      title: track.name,
      thumbnail: track.thumbnail,
      duration: track.durationInSec,
      playlist: res.name,
    }));
  } else if (res.type === "track") {
    return [
      {
        url: res.url,
        title: res.name,
        thumbnail: "",
        duration: res.durationInSec,
      },
    ];
  } else {
    throw new Error("Video not found!");
  }
};
