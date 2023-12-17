import consola from "consola";
import { playlist_info, video_info } from "play-dl";
import { parseYtPlaylistUrl } from "../utils/play-dl.js";

const getYt = async (url: string, type: YouTubeType): Promise<Video[]> => {
  if (type === "playlist") {
    const parsedUrl = parseYtPlaylistUrl(url);
    consola.info("Getting playlist info by URL...");
    consola.info(parsedUrl);
    const playlist = await playlist_info(parsedUrl, { incomplete: true });
    const tracks = await playlist.all_videos();
    return tracks.map((video) => {
      const song = video as Video;
      if (playlist.title && playlist.url)
        song.playlist = {
          title: playlist.title,
          url: playlist.url,
          thumbnail: playlist.thumbnail?.url ?? "https://cdn.discordapp.com/embed/avatars/0.png",
        };
      return song;
    });
  } else {
    const video = await video_info(url);
    return [video.video_details];
  }
};

export default getYt;
