import type { ObjectId } from "mongodb";
import guildModel from "../models/guild.js";
import type { ISong } from "../types/song.js";
import type { IPlaylist } from "../types/playlist.js";

class GuildService {
  // specific guild operations
  static async getGuild(guildId: string) {
    return (await guildModel.findOne({ guildId })) || (await guildModel.create({ guildId }));
  }
  static async getCurrentSong(guildId: string) {
    const guild = await this.getGuild(guildId);
    if (!guild.queue.length) return;

    await guild.populate({
      path: "queue",
      options: { limit: 1 },
    });
    return guild.queue[0] as unknown as ISong;
  }

  static async playNext(guildId: string, amount = 1) {
    const guild = await this.getGuild(guildId);
    const queue = guild.queue;
    if (queue.length === 0) return;

    guild.queue = queue.slice(amount);
    return await guild.save();
  }

  //playlist operations
  static async addPlaylist(guildId: string, ...playlists: ObjectId[]) {
    const guild = await this.getGuild(guildId);
    guild.playlists.push(...playlists);
    return await guild.save();
  }

  static async getPlaylists(guildId: string) {
    const guild = await this.getGuild(guildId);
    await guild.populate("playlists");
    return guild.playlists as unknown as IPlaylist[];
  }

  static async getPlaylistByNameOrUrl(guildId: string, query: string) {
    const list = await this.getPlaylists(guildId);
    return list.find((p) => p.name.toLowerCase() === query.toLowerCase() || p.url === query);
  }

  static async searchPlaylists(guildId: string, query: string) {
    const list = await this.getPlaylists(guildId);
    return list.filter(
      (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.url === query
    );
  }

  static async removePlaylist(guildId: string, playlistId: ObjectId) {
    const guild = await this.getGuild(guildId);
    const lenght = guild.playlists.length;
    guild.playlists = guild.playlists.filter((p) => !p.equals(playlistId));

    return lenght === guild.playlists.length ? null : await guild.save();
  }

  static async clearPlaylists(guildId: string) {
    const guild = await this.getGuild(guildId);
    guild.playlists = [];
    return await guild.save();
  }

  static async hasPlaylist(guildId: string, playlistId: ObjectId) {
    const guild = await this.getGuild(guildId);
    return guild.playlists.some((p) => p.equals(playlistId));
  }

  //queue operations
  static async addToQueue(guildId: string, ...songs: ObjectId[]) {
    const guild = await this.getGuild(guildId);
    guild.queue.push(...songs);
    return await guild.save();
  }

  static async getQueue(guildId: string) {
    const guild = await this.getGuild(guildId);
    await guild.populate("queue");
    return guild.queue as unknown as ISong[];
  }

  static async searchInQueue(guildId: string, query: string) {
    const list = await this.getQueue(guildId);
    return list.filter(
      (s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.url === query
    );
  }

  static async removeFromQueue(guildId: string, songId: ObjectId) {
    const guild = await this.getGuild(guildId);
    const index = guild.queue.findIndex((s) => s.equals(songId));
    if (index === -1) return null;

    guild.queue.splice(index, 1);
    return await guild.save();
  }

  static async clearQueue(guildId: string) {
    const guild = await this.getGuild(guildId);
    guild.queue = [];
    return await guild.save();
  }

  //general operations
  static async setPrefix(guildId: string, prefix: string) {
    const guild = await this.getGuild(guildId);
    guild.prefix = prefix;
    return await guild.save();
  }

  static async setVolume(guildId: string, volume: number) {
    const guild = await this.getGuild(guildId);
    guild.volume = Math.min(200, Math.max(0, volume));
    return await guild.save();
  }

  static async setMaxQueueSize(guildId: string, size: number) {
    const guild = await this.getGuild(guildId);
    guild.maxQueueSize = size;
    return await guild.save();
  }

  static async toggleLoop(guildId: string) {
    const guild = await this.getGuild(guildId);
    guild.loop = !guild.loop;
    return await guild.save();
  }
}

export default GuildService;
