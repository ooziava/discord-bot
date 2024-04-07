import type { ISong } from "../types/song.js";

export class SongService {
  static async save(song: ISong) {
    // Save song
  }

  static async get(id: string) {
    // Get song
  }

  static async getAll() {
    // Get all songs
  }

  static async update(id: string, song: ISong) {
    // Update song
  }

  static async delete(id: string) {
    // Delete song
  }

  static async search(query: string) {
    // Search songs
  }

  static async getDuration(id: string) {
    // Get song duration
  }

  static async getDurationAll() {
    // Get all songs duration
  }
}
