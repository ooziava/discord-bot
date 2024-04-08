import mongoose, { Schema } from "mongoose";
import type { IGuild } from "../types/guild.js";
import { MongooseModelsEnum } from "../types/models.js";

const GuildSchema: Schema = new Schema({
  guildId: { type: String, required: true, unique: true },
  queue: [{ type: [Schema.Types.ObjectId], ref: MongooseModelsEnum.Song }],
  playlists: [{ type: Schema.Types.ObjectId, ref: MongooseModelsEnum.Playlist }],
  prefix: { type: String, default: "!" },
  volume: { type: Number, default: 100 },
  loop: { type: Boolean, default: false },
  maxQueueSize: { type: Number, default: 100 },
});

export default mongoose.model<IGuild>(MongooseModelsEnum.Guild, GuildSchema);
