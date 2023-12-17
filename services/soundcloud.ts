import { SoundCloudPlaylist, SoundCloudTrack, soundcloud } from "play-dl";
import { searchYtVideo } from "../utils/play-dl.js";

const getSoundlcoud = async (url: string, type: SpotifyType) => {
  const so = await soundcloud(url);

  const tracks =
    type === "playlist" ? await (so as SoundCloudPlaylist).all_tracks() : [so as SoundCloudTrack];

  //   const videos = await Promise.all(
  //     tracks.map(async (track) => {
  //       const video = await searchYtVideo(
  //         `${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
  //       );
  //       console.log(`${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`);
  //       return video;
  //     })
  //   );

  //   for (const track of tracks) {
  //     const video = await searchYtVideo(
  //       `${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
  //     );
  //     console.log(`${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`);
  //     videos.push(video);
  //   }

  return tracks;
};

export default getSoundlcoud;
