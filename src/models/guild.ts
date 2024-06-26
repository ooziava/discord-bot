import mongoose, { Schema } from "mongoose";

import { type IGuild, MongooseModelsEnum } from "../types/index.js";

export const GuildSchema: Schema = new Schema({
  guildId: { type: String, required: true, unique: true },
  queue: [{ type: Schema.Types.ObjectId, ref: MongooseModelsEnum.Song }],
  playlists: [{ type: Schema.Types.ObjectId, ref: MongooseModelsEnum.Playlist }],
  prefix: { type: String, default: "!" },
  volume: { type: Number, default: 100 },
  loop: { type: Number, default: 0 },
  outsideQ: { type: Number, default: 0 },
  maxQueueSize: { type: Number, default: 100 },
});

export default mongoose.model<IGuild>(MongooseModelsEnum.Guild, GuildSchema);
