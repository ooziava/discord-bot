import { type SpotifyAlbum, type SpotifyPlaylist, type YouTubePlayList } from "play-dl";

import playlistModel from "../models/playlist.js";

import { getPlaylistSource, getPlaylistUrl, isURL } from "../utils/urls.js";

import { type NewPlaylist, type ISong, SourceEnum } from "../types/index.js";

export default class PlaylistService {
  // crud operations
  static async save(playlist: NewPlaylist) {
    return await playlistModel.create(playlist);
  }

  static async getById(id: string) {
    return await playlistModel.findById(id);
  }

  static async getByUrl(input: string) {
    const url = getPlaylistUrl(input);
    return await playlistModel.findOne({ url });
  }

  static async isExists(input: string) {
    const url = getPlaylistUrl(input);
    return await playlistModel.exists({ url });
  }

  static async getByName(input: string) {
    return await playlistModel.findOne({ name: input });
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
  static async search(query: string, limit?: number) {
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    return await playlistModel.find(
      { $or: [{ name: { $regex: `^${escapedQuery}`, $options: "i" } }, { url: query }] },
      {},
      { limit }
    );
  }

  static async getAll() {
    return await playlistModel.find();
  }

  static async getList(limit?: number) {
    return await playlistModel.find({}, {}, { limit });
  }

  static async removeAll() {
    return await playlistModel.deleteMany();
  }

  // song operations
  static async addSongs(id: string, ...songs: ISong[]) {
    return await playlistModel.findByIdAndUpdate(id, { $push: { songs: { $each: songs } } });
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
    return await playlistModel.findByIdAndUpdate(id, { $pull: { songs: song } });
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
      url: getPlaylistUrl(playlist.url || playlist.link) || "https://www.youtube.com",
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
      url: getPlaylistUrl(playlist.url) || "https://open.spotify.com",
      thumbnail: playlist.thumbnail.url || "https://cdn.discordapp.com/embed/avatars/0.png",
      songs: [],
      source: SourceEnum.Spotify,
    };
  }

  static parseSpotifyAlbum(album: SpotifyAlbum): NewPlaylist {
    return {
      name: album.name || "Unknown title",
      artist: album.artists?.map((a) => a.name).join(", ") || "Unknown artist",
      url: getPlaylistUrl(album.url) || "https://open.spotify.com",
      thumbnail: album.thumbnail.url || "https://cdn.discordapp.com/embed/avatars/0.png",
      songs: [],
      source: SourceEnum.Spotify,
    };
  }
}
