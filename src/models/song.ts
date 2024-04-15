import mongoose, { Schema } from "mongoose";
import type { ISong } from "../types/song.js";
import { SourceEnum } from "../types/source.js";
import { MongooseModelsEnum } from "../types/models.js";

const songSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: Number, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, required: true },
  source: { type: String, enum: [SourceEnum.Youtube, SourceEnum.Spotify], required: true },
});
songSchema.index({ title: "text", artist: "text" });

const Song = mongoose.model<ISong>(MongooseModelsEnum.Song, songSchema);

export default Song;
