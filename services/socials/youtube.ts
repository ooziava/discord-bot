import { Song } from "interfaces/discordjs.js";
import { search, playlist_info, video_info } from "play-dl";

export default async (query: string, info: string): Promise<Song[]> => {
  // Search for the video
  if (info === "search") {
    const song = (await search(query, { limit: 1 }))[0];
    if (!song) throw new Error("No video found!");
    return [
      {
        title: song.title ?? query,
        url: song.url,
        duration: song.durationInSec,
        thumbnail: song.thumbnails[0].url,
      },
    ];
  }

  if (info.includes("playlist")) {
    const musicList = await playlist_info(query, { incomplete: true });
    await musicList.fetch();
    const tracks = musicList.page(1);
    if (!tracks?.length) throw new Error("Playlist not found!");

    return tracks.map((track) => ({
      title: track.title ?? query,
      url: track.url,
      duration: track.durationInSec,
      thumbnail: track.thumbnails[0].url,
    }));
  } else {
    const video = await video_info(query);
    if (!video) throw new Error("No video found!");
    return [
      {
        title: video?.video_details?.title || query,
        url: video?.video_details.url,
        duration: video?.video_details?.durationInSec,
        thumbnail: video?.video_details?.thumbnails[0]?.url,
      },
    ];
  }
};
