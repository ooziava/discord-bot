import type { Document } from "mongoose";
import type { ISong } from "./song.js";
import type { IPlaylist } from "./playlist.js";

export interface IGuild extends Document {
  guildId: string;
  queue: ISong[];
  playlists: IPlaylist[];
  prefix: string;
  volume: number;
  loop: boolean;
  autoplay: boolean;
  maxQueueSize: number;
}
