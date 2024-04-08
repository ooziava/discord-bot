import type { IPlaylist } from "../types/playlist.js";
import type { ISong } from "../types/song.js";
import playlistModel from "../models/playlist.js";

export default class PlaylistService {
  static async create(playlist: IPlaylist) {
    return await playlistModel.create(playlist);
  }

  static async update(id: string, playlist: IPlaylist) {
    const updatedPlaylist = await playlistModel.findByIdAndUpdate(id, playlist);
    if (!updatedPlaylist) throw new Error("Playlist not found");
  }

  static async delete(id: string) {
    await playlistModel.findByIdAndDelete(id);
  }

  static async search(query: string) {
    return await playlistModel.find({ $text: { $search: query } });
  }
  static async get(id: string) {
    const playlist = await playlistModel.findById(id);
    if (!playlist) throw new Error("Playlist not found");
    return playlist;
  }

  static async getAll() {
    return await playlistModel.find();
  }

  static async getLength(id: string) {
    const playlist = await this.get(id);
    return playlist.songs.length;
  }

  static async getDuration(id: string) {
    const playlist = await this.get(id);
    return playlist.songs.reduce((acc, song) => acc + song.duration, 0);
  }

  static async getDurationAll() {
    const playlists = await playlistModel.find();
    return playlists.reduce(
      (acc, playlist) => acc + playlist.songs.reduce((acc, song) => acc + song.duration, 0),
      0
    );
  }

  static async getPlaylistSongs(id: string) {
    const playlist = await this.get(id);
    await playlist.populate("songs");
    return playlist.songs;
  }

  static async addSong(id: string, song: ISong) {
    const playlist = await this.get(id);
    playlist.songs.push(song._id);
    await playlist.save();
  }

  static async removeSong(id: string, song: ISong) {
    const playlist = await this.get(id);
    playlist.songs = playlist.songs.filter((s) => !s.equals(song._id));
    await playlist.save();
  }
}
