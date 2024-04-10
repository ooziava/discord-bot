import type { Document } from "mongoose";
import type { Source } from "./source.js";

export type NewSong = {
  title: string;
  artist: string;
  duration: number;
  url: string;
  thumbnail: string;
  source: Source;
};

export interface ISong extends NewSong, Document {}
