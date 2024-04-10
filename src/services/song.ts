import type { NewSong } from "../types/song.js";
import songModel from "../models/song.js";

export default class SongService {
  static async save(song: NewSong) {
    return await songModel.create(song);
  }

  static async update(id: string, song: NewSong) {
    return await songModel.findByIdAndUpdate(id, song);
  }

  static async remove(id: string) {
    return await songModel.findByIdAndDelete(id);
  }

  static async search(query: string) {
    return await songModel.find({ $text: { $search: query } });
  }

  static async getById(id: string) {
    return await songModel.findById(id);
  }

  static async getByUrl(url: string) {
    return await songModel.findOne({
      url,
    });
  }

  static async getAll() {
    return await songModel.find();
  }
}
