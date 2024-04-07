import type { Document, Types } from "mongoose";

export interface IQueue extends Document {
  playlistOrSong: Types.ObjectId;
  current: boolean;
}
