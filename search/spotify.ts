import { spotify } from "play-dl";
import type { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack, YouTubeVideo } from "play-dl";
import { searchYtVideo } from "../utils/play-dl.js";

const getYtFromSpotify = async (url: string, type: SpotifyType): Promise<Track[]> => {
  const sp = await spotify(url);

  const tracks =
    type === "album" || type === "playlist"
      ? await (sp as SpotifyAlbum | SpotifyPlaylist).all_tracks()
      : [sp as SpotifyTrack];

  const videos = await Promise.all(
    tracks.map(async (track) => {
      const video = await searchYtVideo(
        `${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
      );
      console.log(`${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`);
      return video;
    })
  );

  // const videos = [];
  // for (const track of tracks) {
  //   const video = await searchYtVideo(
  //     `${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
  //   );
  //   console.log(`${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`);
  //   videos.push(video);
  // }

  return videos.filter((video) => video) as YouTubeVideo[] | Track[];
};

export default getYtFromSpotify;
