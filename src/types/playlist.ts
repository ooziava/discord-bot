import type { Document } from "mongoose";
import type { Source } from "./source.js";
import type { ISong } from "./song.js";

export type NewPlaylist = {
  name: string;
  artist: string;
  duration: number;
  url: string;
  thumbnail?: string;
  source: Source;
  songs: ISong[];
};

export interface IPlaylist extends NewPlaylist, Document {}
