import type { NewPlaylist } from "../types/playlist.js";
import type { ISong } from "../types/song.js";
import playlistModel from "../models/playlist.js";

export default class PlaylistService {
  static async save(playlist: NewPlaylist) {
    return await playlistModel.create(playlist);
  }

  static async update(id: string, playlist: NewPlaylist) {
    return await playlistModel.findByIdAndUpdate(id, playlist);
  }

  static async remove(id: string) {
    return await playlistModel.findByIdAndDelete(id);
  }

  static async search(query: string) {
    return await playlistModel.find({ $text: { $search: query } });
  }

  static async getById(id: string) {
    return await playlistModel.findById(id);
  }

  static async getByUrl(url: string) {
    return await playlistModel.findOne({
      url,
    });
  }

  static async getAll() {
    return await playlistModel.find();
  }

  static async getLength(id: string) {
    const playlist = await this.getById(id);
    return playlist?.songs.length;
  }

  static async getDuration(id: string) {
    const playlist = await this.getById(id);
    return playlist?.songs.reduce((acc, song) => acc + song.duration, 0);
  }

  static async getDurationAll() {
    const playlists = await playlistModel.find();
    return playlists.reduce(
      (acc, playlist) => acc + playlist.songs.reduce((acc, song) => acc + song.duration, 0),
      0
    );
  }

  static async getPlaylistSongs(id: string) {
    const playlist = await this.getById(id);
    await playlist?.populate("songs");
    return playlist?.songs;
  }

  static async addSong(id: string, song: ISong) {
    const playlist = await this.getById(id);
    playlist?.songs.push(song._id);
    return await playlist?.save();
  }

  static async removeSong(id: string, song: ISong) {
    const playlist = await this.getById(id);
    if (!playlist) return;

    playlist.songs = playlist.songs.filter((s) => !s.equals(song._id));
    return await playlist?.save();
  }
}
