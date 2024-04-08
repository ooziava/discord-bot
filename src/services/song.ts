import type { ISong } from "../types/song.js";
import songModel from "../models/song.js";

export default class SongService {
  static async create(song: ISong) {
    return await songModel.create(song);
  }

  static async update(id: string, song: ISong) {
    const updatedPlaylist = await songModel.findByIdAndUpdate(id, song);
    if (!updatedPlaylist) throw new Error("Playlist not found");
  }

  static async delete(id: string) {
    await songModel.findByIdAndDelete(id);
  }

  static async search(query: string) {
    return await songModel.find({ $text: { $search: query } });
  }
  static async get(id: string) {
    const song = await songModel.findById(id);
    if (!song) throw new Error("Song not found");
    return song;
  }

  static async getAll() {
    return await songModel.find();
  }
}
