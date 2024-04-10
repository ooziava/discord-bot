import guildModel from "../models/guild.js";
import type { IGuild } from "../types/guild.js";
import type { ISong } from "../types/song.js";
import type { IPlaylist } from "../types/playlist.js";

export default class GuildService {
  private guild: IGuild;
  lastSong: ISong | undefined;
  constructor(guild: IGuild) {
    this.guild = guild;
  }

  static async init(guildId: string) {
    const guild = (await this.getGuild(guildId)) || (await this.createGuild(guildId));
    return new GuildService(guild);
  }
  private static async getGuild(guildId: string) {
    return await guildModel.findOne({ guildId }).populate("queue").populate("playlists");
  }
  private static async createGuild(guildId: string) {
    return await guildModel.create({ guildId });
  }

  getCurrentSong() {
    return this.guild.queue[0] || null;
  }

  async playNext() {
    const queue = this.guild.queue;
    if (queue.length === 0) return;

    this.lastSong = queue.shift();
    return await this.guild.save();
  }

  async playPrev() {
    if (!this.lastSong) return;
    const queue = this.guild.queue;
    queue.unshift(this.lastSong);
    return await this.guild.save();
  }

  async addPlaylist(playlists: IPlaylist) {
    this.guild.playlists.push(playlists._id);
    return await this.guild.save();
  }

  async addQueue(...items: ISong[]) {
    this.guild.queue.push(...items.map((i) => i._id));
    return await this.guild.save();
  }

  async removePlaylist(playlist: IPlaylist) {
    this.guild.playlists = this.guild.playlists.filter((p) => !p.equals(playlist._id));
    return await this.guild.save();
  }

  async removeQueue(item: ISong) {
    this.guild.queue = this.guild.queue.filter((i) => !i.equals(item._id));
    return await this.guild.save();
  }

  getQueue() {
    return this.guild.queue;
  }

  getPlaylists() {
    return this.guild.playlists;
  }

  getPrefix() {
    return this.guild.prefix;
  }

  getVolume() {
    return this.guild.volume;
  }

  getMaxQueueSize() {
    return this.guild.maxQueueSize;
  }

  isLoop() {
    return this.guild.loop;
  }

  async setPrefix(prefix: string) {
    this.guild.prefix = prefix;
    return await this.guild.save();
  }

  async setVolume(volume: number) {
    this.guild.volume = Math.min(200, Math.max(0, volume));
    return await this.guild.save();
  }

  async setMaxQueueSize(size: number) {
    this.guild.maxQueueSize = size;
    return await this.guild.save();
  }

  async setLoop(loop: boolean) {
    this.guild.loop = loop;
    return await this.guild.save();
  }
}
