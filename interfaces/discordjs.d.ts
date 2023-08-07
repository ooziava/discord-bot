import {
  Collection,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { AudioPlayer, PlayerSubscription } from "@discordjs/voice";

export interface Bot {
  client: Client;
  commands: Collection<string, Command>;
  interactions: Collection<string, CommandInteraction>;
  activeMessages: Collection<string, string>;
  subscriptions: Collection<string, PlayerSubscription>;
  players: Collection<string, AudioPlayer>;
  playersOptions: Collection<string, PlayerOptions>;
  songs: Collection<string, Song>;
  songAttributes: Collection<string, SongAttributes>;
}

export type Execute = (interaction: CommandInteraction) => Promise<void>;

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: Execute;
  voice: boolean;
}

export interface Commands extends Collection<string, Command> {}

export interface Queue {
  currentSongId: number;
  songs: Song[];
}

export interface Song {
  index?: number;
  title: string;
  url: string;
  duration: number;
  thumbnail: string;
  playlist?: string;
  author?: Author;
  user?: Author;
  timestamp: Date;
}

export interface SongAttributes {
  loop: boolean;
}

export interface Author {
  name: string;
  url: string;
  avatar: string;
}

export interface PlayerOptions {
  visible: boolean;
}
