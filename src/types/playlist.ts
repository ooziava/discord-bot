import type { Document, Types } from "mongoose";
import type { Source } from "./source.js";

export type NewPlaylist = {
  name: string;
  artist: string;
  url: string;
  thumbnail?: string;
  source: Source;
  songs: Types.ObjectId[];
};

export interface IPlaylist extends NewPlaylist, Document {}
