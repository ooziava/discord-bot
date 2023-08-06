import { search, spotify } from "play-dl";
export default async (query) => {
    const res = await spotify(query);
    if (res.type === "playlist") {
        const tracks = await res.all_tracks();
        const songs = tracks.map((track) => ({
            url: track.url,
            title: track.name,
            thumbnail: track.thumbnail?.url ?? "",
            duration: track.durationInSec,
            playlist: res.name,
            timestamp: new Date(),
        }));
        return Promise.all(songs.map(async (song) => {
            const newSong = await search(song.title, { limit: 1 });
            song.url = newSong[0].url;
            song.duration = newSong[0].durationInSec;
            return song;
        }));
    }
    else if (res.type === "track") {
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
    }
    else {
        throw new Error("Video not found!");
    }
};
