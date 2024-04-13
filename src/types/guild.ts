import type { Document, Types } from "mongoose";

export type NewGuild = {
  guildId: string;
  queue: Types.ObjectId[];
  playlists: Types.ObjectId[];
  prefix: string;
  volume: number;
  loop: boolean;
  maxQueueSize: number;
};

export interface IGuild extends NewGuild, Document {}
