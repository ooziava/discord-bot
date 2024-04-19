import { validate, type SpotifyAlbum, type SpotifyPlaylist, type YouTubePlayList } from "play-dl";

import playlistModel from "../models/playlist.js";

import { getPlaylistSource, getPlaylistUrl, isURL } from "../utils/urls.js";

import { type NewPlaylist, type ISong, SourceEnum } from "../types/index.js";

export default class PlaylistService {
  // crud operations
  static save(playlist: NewPlaylist) {
    return playlistModel.create(playlist);
  }

  static getById(id: string) {
    return playlistModel.findById(id);
  }

  static async getByUrl(input: string) {
    const source = await getPlaylistSource(input);
    const url = getPlaylistUrl(input, source);
    return playlistModel.findOne({ url });
  }

  static getByName(input: string) {
    return playlistModel.findOne({ name: input });
  }

  static getByNameOrUrl(input: string) {
    return isURL(input) ? this.getByUrl(input) : this.getByName(input);
  }

  static update(id: string, playlist: NewPlaylist) {
    return playlistModel.findByIdAndUpdate(id, playlist);
  }

  static remove(id: string) {
    return playlistModel.findByIdAndDelete(id);
  }

  // bulk operations
  static search(query: string, limit?: number) {
    return playlistModel.find({ $text: { $search: query } }, {}, { limit });
  }

  static getAll(limit?: number) {
    return playlistModel.find({}, {}, { limit });
  }

  static removeAll() {
    return playlistModel.deleteMany();
  }

  // song operations
  static addSongs(id: string, ...songs: ISong[]) {
    return playlistModel.findByIdAndUpdate(id, { $push: { songs: { $each: songs } } });
  }

  static async getPlaylistSongs(query: string) {
    const playlist = await playlistModel
      .findOne({
        $or: [{ name: { $regex: new RegExp("^" + query + "$", "i") } }, { url: query }],
      })
      .populate("songs");

    return playlist ? (playlist.songs as unknown as ISong[]) : [];
  }

  static async removeSong(id: string, song: ISong) {
    return playlistModel.findByIdAndUpdate(id, { $pull: { songs: song } });
  }

  // other operations
  static async getSongCount(id: string) {
    const result = await playlistModel.aggregate([
      { $match: { _id: id } },
      { $project: { songCount: { $size: "$songs" } } },
    ]);

    return result.length > 0 ? result[0].songCount : 0;
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
