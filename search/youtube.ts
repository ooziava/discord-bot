import { playlist_info, video_info } from "play-dl";

const getYt = async (url: string, type: YouTubeType): Promise<Track[]> => {
  if (type === "playlist") {
    const playlist = await playlist_info(url, { incomplete: true });
    const tracks = await playlist.all_videos();
    return tracks.map((track) => {
      const song = track as Track;
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
