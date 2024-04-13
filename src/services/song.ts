import type { NewSong } from "../types/song.js";
import songModel from "../models/song.js";
import type { YouTubeVideo } from "play-dl";
import { SourceEnum } from "../types/source.js";

class SongService {
  // crud operations
  static async save(song: NewSong) {
    return await songModel.create(song);
  }

  static async getById(id: string) {
    return await songModel.findById(id);
  }

  static async getByUrl(url: string) {
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
    return await songModel.find({ $text: { $search: query } });
  }

  static async getAll() {
    return await songModel.find();
  }

  //other operations
  static parseYoutubeVideo(video: YouTubeVideo): NewSong {
    return {
      title: video.title || "Unknown title",
      url: video.url,
      thumbnail: video.thumbnails[0].url,
      duration: video.durationInSec,
      artist: video.channel?.name || "Unknown artist",
      source: SourceEnum.Youtube,
    };
  }
}

export default SongService;
