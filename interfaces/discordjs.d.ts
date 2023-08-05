import { PlayerSubscription } from "@discordjs/voice";
import { Collection, CommandInteraction } from "discord.js";

export interface Bot {
  commands: Collection<string, Command>;
  client: Client;
  subscriptions: Collection<string, PlayerSubscription>;
  interactions: Collection<string, CommandInteraction>;
  songAttributes: Collection<string, SongAttributes>;
  currentSong: Collection<string, Song>;
  activeMessageIds: Collection<string, string>;
}

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction, bot: Bot) => Promise<void>;
}

export interface Commands extends Collection<string, Command> {}

export interface Queue {
  lastAddedIndex: number;
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
  isLooping?: boolean;
  isQueueLooping?: boolean;
  optionsVisible?: boolean;
}

export interface Author {
  name: string;
  url: string;
  avatar: string;
}
