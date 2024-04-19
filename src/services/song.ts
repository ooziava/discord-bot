import { validate, type YouTubeVideo } from "play-dl";

import songModel from "../models/song.js";

import { getSongUrl } from "../utils/urls.js";

import { SourceEnum, type NewSong } from "../types/index.js";

class SongService {
  // crud operations
  static async save(song: NewSong) {
    return await songModel.create(song);
  }

  static async getById(id: string) {
    return await songModel.findById(id);
  }

  static async getByUrl(input: string) {
    const result = await validate(input).catch(() => null);
    const source = result && result.includes("sp_") ? SourceEnum.Spotify : SourceEnum.Youtube;
    const url = getSongUrl(input, source);
    return await songModel.findOne({
      url,
    });
  }

  static async update(id: string, song: NewSong) {
    return await songModel.findByIdAndUpdate(id, song);
  }

  static async remove(id: string) {
    return await songModel.findByIdAndDelete(id);
  }

  // bulk operations
  static async search(query: string) {
    return await songModel
      .find({ $text: { $search: query, $caseSensitive: false, $diacriticSensitive: false } })
      .limit(10);
  }

  static async getAll() {
    return await songModel.find();
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
