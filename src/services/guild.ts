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
    let guild = await this.getGuild(guildId);
    if (!guild) guild = await this.createGuild(guildId);
    return new GuildService(guild);
  }
  private static async getGuild(guildId: string) {
    return await guildModel.findOne({ guildId }).populate("queue").populate("playlists");
  }
  private static async createGuild(guildId: string) {
    return await guildModel.create({ guildId });
  }

  async getCurrentSong() {
    return this.guild.queue[0] || null;
  }

  async nextSong() {
    const queue = this.guild.queue;
    if (queue.length === 0) return null;
    const song = queue.shift();
    await this.guild.save();
    return song;
  }

  async addPlaylist(playlists: IPlaylist) {
    this.guild.playlists.push(playlists._id);
    await this.guild.save();
  }

  async addQueue(...items: ISong[]) {
    this.guild.queue.push(...items.map((i) => i._id));
    await this.guild.save();
  }

  async removePlaylist(playlist: IPlaylist) {
    this.guild.playlists = this.guild.playlists.filter((p) => !p.equals(playlist._id));
    await this.guild.save();
  }

  async removeQueue(item: ISong) {
    this.guild.queue = this.guild.queue.filter((i) => !i.equals(item._id));
    await this.guild.save();
  }

  async getQueue() {
    return this.guild.queue;
  }

  async getPlaylists() {
    return this.guild.playlists;
  }

  // This methods will be used later in the project
  async getPrefix() {
    return this.guild.prefix;
  }

  async getVolume() {
    return this.guild.volume;
  }

  async getMaxQueueSize() {
    return this.guild.maxQueueSize;
  }

  async isLoop() {
    return this.guild.loop;
  }

  async isAutoplay() {
    return this.guild.autoplay;
  }

  async setPrefix(prefix: string) {
    this.guild.prefix = prefix;
    await this.guild.save();
  }

  async setVolume(volume: number) {
    this.guild.volume = Math.min(200, Math.max(0, volume));
    await this.guild.save();
  }

  async setMaxQueueSize(size: number) {
    this.guild.maxQueueSize = size;
    await this.guild.save();
  }

  async setLoop(loop: boolean) {
    this.guild.loop = loop;
    await this.guild.save();
  }

  async setAutoplay(autoplay: boolean) {
    this.guild.autoplay = autoplay;
    await this.guild.save();
  }
}
