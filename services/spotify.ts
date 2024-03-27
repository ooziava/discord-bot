import { spotify, SpotifyTrack } from "play-dl";
import type { SpotifyAlbum, SpotifyPlaylist, YouTubeVideo } from "play-dl";
import { searchYtVideo } from "../utils/play-dl.js";

const getSpotify = async (url: string, type: SpotifyType): Promise<Video[]> => {
  // {
  //   track: SpotifyTrack;
  //   playlist?: {
  //     title: string;
  //     url: string;
  //     thumbnail: string;
  //   };
  // }[]
  const sp = await spotify(url);
  // if (type === "album" || type === "playlist") {
  //   const spAlbum = sp as SpotifyAlbum | SpotifyPlaylist;
  //   const tracks = (await spAlbum.all_tracks()).map((track) => ({
  //     track,
  //     playlist: { title: spAlbum.name, url: spAlbum.url, thumbnail: spAlbum.thumbnail.url },
  //   }));
  //   return tracks;
  // } else {
  //   const track = sp as SpotifyTrack;
  //   const [video] = await searchYtVideo(
  //     `${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
  //   );
  //   if (video) video.playlist = undefined;
  //   return [{ track }];
  // }
  const tracks =
    type === "album" || type === "playlist"
      ? await (sp as SpotifyAlbum | SpotifyPlaylist).all_tracks()
      : [sp as SpotifyTrack];

  const videos = await Promise.all(
    tracks.map(async (track) => {
      const [video] = await searchYtVideo(
        `${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
      );
      if (!(sp instanceof SpotifyTrack) && video)
        video.playlist = { title: sp.name, url: sp.url, thumbnail: sp.thumbnail.url };
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

  return videos.filter((video) => video) as Video[];
};

export default getSpotify;
