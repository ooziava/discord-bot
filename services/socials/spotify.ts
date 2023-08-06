import { type Song } from "interfaces/discordjs";
import { search, spotify, SpotifyPlaylist } from "play-dl";

export default async (query: string): Promise<Song[]> => {
  const res = await spotify(query);

  if (res.type === "playlist") {
    const tracks = await (res as SpotifyPlaylist).all_tracks();

    return Promise.all(
      tracks.map(async (song) => {
        const [newSong] = await search(
          `${song.name} ${song.artists.map((artst) => artst.name).join(" ")}`,
          { limit: 1, source: { youtube: "video" } }
        );

        return {
          url: newSong.url,
          title: newSong.title || song.name,
          thumbnail: newSong.thumbnails[0].url,
          duration: newSong.durationInSec,
          playlist: res.name,
          author: {
            name: newSong.channel?.name || song.artists[0].name,
            url: newSong.channel?.url || song.artists[0].url,
            avatar: newSong.channel?.iconURL() || song.artists[0].url,
          },
          timestamp: new Date(),
        };
      })
    );
  } else if (res.type === "track") {
    const song = {
      url: res.url,
      title: res.name,
      thumbnail: res.thumbnail?.url ?? "",
      duration: 0,
      timestamp: new Date(),
    };

    const newSong = await search(song.title, { limit: 1 });
    song.url = newSong[0].url;
    song.duration = newSong[0].durationInSec;

    return [song];
  } else {
    throw new Error("Video not found!");
  }
};
