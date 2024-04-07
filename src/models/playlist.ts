import mongoose, { Schema } from "mongoose";
import type { IPlaylist } from "../types/playlist.js";
import { SourceEnum } from "../types/source.js";

const PlaylistSchema: Schema = new Schema({
  name: { type: String, required: true },
  source: { type: String, enum: [SourceEnum.Youtube, SourceEnum.Spotify], required: true },
  songs: [{ type: mongoose.Types.ObjectId, ref: "Song" }],
});

export default mongoose.model<IPlaylist>("Playlist", PlaylistSchema);
