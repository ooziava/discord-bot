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
    return guild.queue[0] || null;
  }

  static async playNext(guildId: string) {
    const guild = await this.getGuild(guildId);
    const queue = guild.queue;
    if (queue.length === 0) return;

    // this.lastSong = queue.shift();
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

  static async removeFromQueue(guildId: string, songId: ObjectId) {
    const guild = await this.getGuild(guildId);
    guild.queue = guild.queue.filter((s) => !s.equals(songId));
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

  static async setLoop(guildId: string, loop: boolean) {
    const guild = await this.getGuild(guildId);
    guild.loop = loop;
    return await guild.save();
  }
}

export default GuildService;
