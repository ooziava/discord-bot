import type { ObjectId } from "mongodb";

import guildModel from "../models/guild.js";

import type { IGuild, IPlaylist, ISong } from "../types/index.js";

export default class GuildService {
  // specific guild operations
  static getGuild(guildId: string) {
    return guildModel.findOneAndUpdate(
      { guildId: guildId },
      { guildId: guildId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  static async getCurrentSong(guildId: string) {
    let guild = await guildModel.findOne({ guildId }).populate({
      path: "queue",
      justOne: true,
    });

    if (!guild) guild = await this.getGuild(guildId);
    return guild.queue as unknown as ISong | null;
  }

  static async playNext(guildId: string, amount = 1) {
    const guild = await this.getGuild(guildId);
    if (!guild.loop) {
      if (guild.queue.length <= amount) {
        guild.queue = [];
      } else {
        guild.queue = guild.queue.slice(amount);
      }
    }
    return await guild.save();
  }

  //playlist operations
  static addPlaylist(guildId: string, ...playlists: ObjectId[]) {
    return guildModel.updateOne({ guildId, $push: { playlists: { $each: playlists } } });
  }

  static async getPlaylists(guildId: string, limit?: number) {
    const query = guildModel.findOne({ guildId });
    if (limit) query.limit(limit);

    let guild = await query.populate("playlists").exec();
    if (!guild) guild = await this.getGuild(guildId);

    return guild.playlists as unknown as IPlaylist[];
  }

  static async getPlaylistByNameOrUrl(guildId: string, query: string) {
    const lowerCaseQuery = query.toLowerCase();
    let guild = await guildModel.findOne({ guildId }).populate({
      path: "playlists",
      match: {
        $or: [{ name: { $regex: new RegExp("^" + lowerCaseQuery + "$", "i") } }, { url: query }],
      },
    });
    if (!guild) guild = await this.getGuild(guildId);

    return guild.playlists.length > 0 ? (guild.playlists[0] as unknown as IPlaylist) : null;
  }

  static async searchPlaylists(guildId: string, query: string, limit?: number) {
    const lowerCaseQuery = query.toLowerCase();

    let guild = await guildModel
      .findOne({ guildId })
      .populate({
        path: "playlists",
        match: {
          $or: [{ name: { $regex: new RegExp(lowerCaseQuery, "i") } }, { url: query }],
        },
        options: { limit },
      })
      .exec();

    if (!guild) guild = await this.getGuild(guildId);
    return guild.playlists as unknown as IPlaylist[];
  }

  static removePlaylist(guildId: string, playlistId: ObjectId) {
    return guildModel.updateOne({ guildId }, { $pull: { playlists: playlistId } });
  }

  static clearPlaylists(guildId: string) {
    return guildModel.updateOne({ guildId }, { playlists: [] });
  }

  static hasPlaylist(guildId: string, playlistId: ObjectId) {
    return guildModel.exists({ guildId, playlists: playlistId });
  }

  //queue operations
  static addToQueue(guildId: string, ...songs: ObjectId[]) {
    return guildModel.updateOne({ guildId }, { $push: { queue: { $each: songs } } });
  }

  static async getQueue(guildId: string, limit?: number) {
    let guild = await guildModel.findOne({ guildId }).populate({
      path: "queue",
      options: { limit },
    });
    if (!guild) guild = await this.getGuild(guildId);

    return guild.queue as unknown as ISong[];
  }

  static async searchInQueue(guildId: string, query: string, limit?: number) {
    const lowerCaseQuery = query.toLowerCase();
    let guild = await guildModel.findOne({ guildId }).populate({
      path: "queue",
      match: {
        $or: [{ title: { $regex: new RegExp(lowerCaseQuery, "i") } }, { url: query }],
      },
      options: { limit },
    });
    if (!guild) guild = await this.getGuild(guildId);

    return guild.queue as unknown as ISong[];
  }

  static removeFromQueue(guildId: string, songId: ObjectId) {
    return guildModel.updateOne({ guildId }, { $pull: { queue: songId } });
  }

  static clearQueue(guildId: string) {
    return guildModel.updateOne({ guildId }, { queue: [] });
  }

  //general operations
  static setPrefix(guildId: string, prefix: string) {
    return guildModel.updateOne({ guildId }, { prefix });
  }

  static async getPrefixes() {
    const guilds = await guildModel.find().select("guildId prefix -_id");
    return guilds as { guildId: string; prefix: string }[];
  }

  static setVolume(guildId: string, volume: number) {
    return guildModel.updateOne({ guildId }, { volume });
  }

  static setMaxQueueSize(guildId: string, size: number) {
    return guildModel.updateOne({ guildId }, { maxQueueSize: size });
  }

  static async toggleLoop(guildId: string) {
    const updatedGuild = await guildModel.findOneAndUpdate(
      { guildId },
      [{ $set: { loop: { $not: "$loop" } } }],
      { new: true, fields: { loop: 1, _id: 0 } }
    );
    return updatedGuild ? updatedGuild.loop : undefined;
  }

  static async getPlayerMeta(guildId: string) {
    const guild = await guildModel.findOne({ guildId }).select("guildId loop volume -_id");
    if (!guild) return this.getGuild(guildId);
    return guild as { guildId: string; loop: boolean; volume: number };
  }
}
