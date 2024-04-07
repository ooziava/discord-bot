import type { Document } from "mongoose";
import type { Source } from "./source.js";
import type { ISong } from "./song.js";

export interface IPlaylist extends Document {
  name: string;
  artist: string;
  duration: number;
  url: string;
  thumbnail?: string;
  source: Source;
  songs: ISong[];
}
