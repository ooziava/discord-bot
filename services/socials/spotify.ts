import { Song } from "interfaces/discordjs.js";
import { search, spotify, SpotifyPlaylist } from "play-dl";

export default async (query: string): Promise<Song[]> => {
  const res = await spotify(query);
  let songs: Song[];
  if (res.type === "playlist")
    songs = (await (res as SpotifyPlaylist).all_tracks()).map((track) => ({
      url: track.url,
      title: track.name,
      thumbnail: track.thumbnail?.url ?? "",
      duration: track.durationInSec,
    }));
  else if (res.type === "track")
    songs = [
      {
        url: res.url,
        title: res.name,
        thumbnail: res.thumbnail?.url ?? "",
        duration: 0,
      },
    ];
  else throw new Error("Video not found!");
  if (!songs) throw new Error("Video not found!");

  return Promise.all(
    songs.map(async (song) => {
      const newSong = await search(song.title, { limit: 1 });
      song.url = newSong[0].url;
      song.duration = newSong[0].durationInSec;
      return song;
    })
  );
};
