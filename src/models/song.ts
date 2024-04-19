import mongoose, { Schema } from "mongoose";

import { type ISong, MongooseModelsEnum, SourceEnum } from "../types/index.js";

export const songSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: Number, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, required: true },
  source: { type: String, enum: [SourceEnum.Youtube, SourceEnum.Spotify], required: true },
});
songSchema.index({ title: "text", artist: "text" });

export default mongoose.model<ISong>(MongooseModelsEnum.Song, songSchema);
