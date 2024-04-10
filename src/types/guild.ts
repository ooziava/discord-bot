import type { Document } from "mongoose";
import type { ISong } from "./song.js";
import type { IPlaylist } from "./playlist.js";

export type NewGuild = {
  guildId: string;
  queue: ISong[];
  playlists: IPlaylist[];
  prefix: string;
  volume: number;
  loop: boolean;
  maxQueueSize: number;
};

export interface IGuild extends NewGuild, Document {}
