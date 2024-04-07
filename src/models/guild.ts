import mongoose, { Schema } from "mongoose";

const GuildSchema: Schema = new Schema({
  queue: { type: mongoose.Types.ObjectId, ref: "Queue" },
  songs: [{ type: mongoose.Types.ObjectId, ref: "Song" }],
  playlists: [{ type: mongoose.Types.ObjectId, ref: "Playlist" }],
  prefix: { type: String, default: "!" },
  filters: { type: Array, default: [] },
  volume: { type: Number, default: 100 },
  loop: { type: Boolean, default: false },
  autoplay: { type: Boolean, default: false },
  maxQueueSize: { type: Number, default: 100 },
});

export default mongoose.model("Guild", GuildSchema);
