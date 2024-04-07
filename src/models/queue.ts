import mongoose, { Schema } from "mongoose";
import type { IQueue } from "../types/queue.js";

const queueSchema: Schema = new Schema({
  displayEmbeds: { type: Boolean, required: true },
  playlistOrSong: { type: Schema.Types.ObjectId, ref: "PlaylistOrSong", required: true },
  currentMarker: { type: Number, required: true },
});

const Queue = mongoose.model<IQueue>("Queue", queueSchema);

export default Queue;
