import mongoose, { Schema } from "mongoose";

import { type IPlaylist, MongooseModelsEnum, SourceEnum } from "../types/index.js";

export const playlistSchema: Schema = new Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  thumbnail: { type: String },
  source: { type: String, enum: [SourceEnum.Youtube, SourceEnum.Spotify], required: true },
  songs: [
    {
      type: Schema.Types.ObjectId,
      ref: MongooseModelsEnum.Song,
    },
  ],
});

export default mongoose.model<IPlaylist>(MongooseModelsEnum.Playlist, playlistSchema);
