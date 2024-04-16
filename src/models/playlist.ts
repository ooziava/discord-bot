import mongoose, { Schema } from "mongoose";
import type { IPlaylist } from "../types/playlist.js";
import { SourceEnum } from "../types/source.js";
import { MongooseModelsEnum } from "../types/models.js";

const playlistSchema: Schema = new Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String },
  source: { type: String, enum: [SourceEnum.Youtube, SourceEnum.Spotify], required: true },
  songs: [
    {
      type: Schema.Types.ObjectId,
      ref: MongooseModelsEnum.Song,
    },
  ],
});
playlistSchema.index({ name: "text", artist: "text" });

export default mongoose.model<IPlaylist>(MongooseModelsEnum.Playlist, playlistSchema);
