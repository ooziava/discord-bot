import { validate, type YouTubeVideo } from "play-dl";

import songModel from "../models/song.js";

import { getSongSource, getSongUrl } from "../utils/urls.js";

import { SourceEnum, type NewSong } from "../types/index.js";

class SongService {
  // crud operations
  static save(song: NewSong) {
    return songModel.create(song);
  }

  static getById(id: string) {
    return songModel.findById(id);
  }

  static async getByUrl(input: string) {
    const source = await getSongSource(input);
    const url = getSongUrl(input, source);
    return songModel.findOne({
      url,
    });
  }

  static update(id: string, song: NewSong) {
    return songModel.findByIdAndUpdate(id, song);
  }

  static remove(id: string) {
    return songModel.findByIdAndDelete(id);
  }

  // bulk operations
  static search(query: string, limit?: number) {
    return songModel.find(
      { $text: { $search: query, $caseSensitive: false, $diacriticSensitive: false } },
      {},
      { limit }
    );
  }

  static getAll(limit?: number) {
    return songModel.find({}, {}, { limit });
  }

  //other operations
  static parseYoutubeVideo(video: YouTubeVideo): NewSong {
    return {
      title: video.title || "Unknown title",
      url: getSongUrl(video.url, SourceEnum.Youtube) || video.url,
      thumbnail: video.thumbnails[0].url,
      duration: video.durationInSec,
      artist: video.channel?.name || "Unknown artist",
      source: SourceEnum.Youtube,
    };
  }
}

export default SongService;
