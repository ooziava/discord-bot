import { type YouTubeVideo } from "play-dl";

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
    const url = getSongUrl(input);
    return songModel.findOne({
      url,
    });
  }

  static async isExist(input: string) {
    const url = getSongUrl(input);
    return await songModel.exists({ url });
  }

  static async update(id: string, song: NewSong) {
    return await songModel.findByIdAndUpdate(id, song);
  }

  static async remove(id: string) {
    return await songModel.findByIdAndDelete(id);
  }

  // bulk operations
  static async search(query: string, limit?: number) {
    return await songModel.find(
      { $or: [{ name: { $regex: new RegExp(query.toLowerCase(), "i") } }, { url: query }] },
      {},
      { limit }
    );
  }

  static async getAll(limit?: number) {
    return await songModel.find({}, {}, { limit });
  }

  //other operations
  static parseYoutubeVideo(video: YouTubeVideo): NewSong {
    return {
      title: video.title || "Unknown title",
      url: getSongUrl(video.url) || video.url,
      thumbnail: video.thumbnails[0].url,
      duration: video.durationInSec,
      artist: video.channel?.name || "Unknown artist",
      source: SourceEnum.Youtube,
    };
  }
}

export default SongService;
