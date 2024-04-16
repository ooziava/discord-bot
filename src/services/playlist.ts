import playlistModel from "../models/playlist.js";
import type { NewPlaylist } from "../types/playlist.js";
import type { ISong } from "../types/song.js";
import { getPlaylistUrl, isURL } from "../utils/urls.js";
import { SourceEnum } from "../types/source.js";
import { validate, type SpotifyAlbum, type SpotifyPlaylist, type YouTubePlayList } from "play-dl";

class PlaylistService {
  // crud operations
  static async save(playlist: NewPlaylist) {
    return await playlistModel.create(playlist);
  }

  static async getById(id: string) {
    return await playlistModel.findById(id);
  }

  static async getByUrl(input: string) {
    const result = await validate(input).catch(() => null);
    const source = result && result.includes("sp_") ? SourceEnum.Spotify : SourceEnum.Youtube;
    const url = getPlaylistUrl(input, source);
    return await playlistModel.findOne({ url });
  }

  static async getByName(name: string) {
    return await playlistModel.findOne({ name });
  }

  static async getByNameOrUrl(input: string) {
    return isURL(input) ? await this.getByUrl(input) : await this.getByName(input);
  }

  static async update(id: string, playlist: NewPlaylist) {
    return await playlistModel.findByIdAndUpdate(id, playlist);
  }

  static async remove(id: string) {
    return await playlistModel.findByIdAndDelete(id);
  }

  // bulk operations
  static async search(query: string) {
    return await playlistModel.find({ $text: { $search: query } });
  }

  static async getAll() {
    return await playlistModel.find();
  }

  static async removeAll() {
    return await playlistModel.deleteMany();
  }

  // song operations
  static async addSong(id: string, song: ISong) {
    const playlist = await this.getById(id);
    playlist?.songs.push(song._id);
    return await playlist?.save();
  }

  static async getPlaylistSongs(query: string) {
    const playlist = await this.getByNameOrUrl(query);
    await playlist?.populate("songs");
    return playlist?.songs as ISong[] | undefined;
  }

  static async removeSong(id: string, song: ISong) {
    const playlist = await this.getById(id);
    if (!playlist) return;

    playlist.songs = playlist.songs.filter((s) => !s.equals(song._id));
    return await playlist?.save();
  }

  // other operations
  static async getSongCount(id: string) {
    const playlist = await this.getById(id);
    return playlist?.songs.length;
  }

  static parseYoutubePlaylist(playlist: YouTubePlayList): NewPlaylist {
    return {
      name: playlist.title || "Unknown title",
      artist: playlist.channel?.name || "Unknown artist",
      url:
        getPlaylistUrl(playlist.url || playlist.link || "", SourceEnum.Youtube) ||
        "https://www.youtube.com",
      thumbnail:
        playlist.thumbnail?.url ||
        playlist.channel?.iconURL() ||
        "https://cdn.discordapp.com/embed/avatars/0.png",
      songs: [],
      source: SourceEnum.Youtube,
    };
  }

  static parseSpotifyPlaylist(playlist: SpotifyPlaylist): NewPlaylist {
    return {
      name: playlist.name || "Unknown title",
      artist: playlist.owner.name || "Unknown artist",
      url: getPlaylistUrl(playlist.url || "", SourceEnum.Spotify) || "https://open.spotify.com",
      thumbnail: playlist.thumbnail.url || "https://cdn.discordapp.com/embed/avatars/0.png",
      songs: [],
      source: SourceEnum.Spotify,
    };
  }

  static parseSpotifyAlbum(album: SpotifyAlbum): NewPlaylist {
    return {
      name: album.name || "Unknown title",
      artist: album.artists?.map((a) => a.name).join(", ") || "Unknown artist",
      url: getPlaylistUrl(album.url || "", SourceEnum.Spotify) || "https://open.spotify.com",
      thumbnail: album.thumbnail.url || "https://cdn.discordapp.com/embed/avatars/0.png",
      songs: [],
      source: SourceEnum.Spotify,
    };
  }
}

export default PlaylistService;
