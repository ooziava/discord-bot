import type { ISong } from "../types/song.js";

export default class PlaylistService {
  static async save(song: ISong) {
    // Save playlist
  }

  static async get(id: string) {
    // Get playlist
  }

  static async getAll() {
    // Get all playlists
  }

  static async update(id: string, song: ISong) {
    // Update playlist
  }

  static async delete(id: string) {
    // Delete playlist
  }

  static async search(query: string) {
    // Search playlists
  }

  static async getDuration(id: string) {
    // Get playlist duration
  }

  static async getDurationAll() {
    // Get all playlists duration
  }

  static async getPlaylistSongs(id: string) {
    // Get all songs in playlist
  }

  static async addSong(id: string, songId: string) {
    // Add song to playlist
  }

  static async removeSong(id: string, songId: string) {
    // Remove song from playlist
  }

  static async hasSong(id: string, songId: string) {
    // Check if song is in playlist
  }

  static async getLength(id: string) {
    // Get playlist length
  }

  static async getCurrentSong(id: string) {
    // Get current song
  }

  static async getCurrentIndex(id: string) {
    // Get current index
  }

  static async next() {
    // Play next
  }
}
