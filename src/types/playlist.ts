import type { Document, Types } from "mongoose";
import type { Source } from "./source.js";

export interface IPlaylist extends Document {
  name: string;
  source: Source;
  songs: Types.ObjectId[];
}
