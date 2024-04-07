import type { Document } from "mongoose";
import type { Source } from "./source.js";

export interface ISong extends Document {
  title: string;
  artist: string;
  duration: number;
  url: string;
  thumbnail: string;
  source: Source;
}
