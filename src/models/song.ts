import mongoose, { Schema } from "mongoose";
import type { ISong } from "../types/song.js";
import { SourceEnum } from "../types/source.js";

const songSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: Number, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, required: true },
  source: { type: String, enum: [SourceEnum.Youtube, SourceEnum.Spotify], required: true },
});

const Song = mongoose.model<ISong>("Song", songSchema);

export default Song;
