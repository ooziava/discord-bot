import { PlayerSubscription } from "@discordjs/voice";
import { Collection } from "discord.js";

export interface Bot {
  commands: Collection<string, Command>;
  client: Client;
  subscriptions: Map<string, PlayerSubscription>;
}

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction, bot: Bot) => Promise<void>;
}

export interface Author {
  name: string;
  url: string;
  avatar: string;
}

export interface Commands extends Collection<string, Command> {}

export interface Song {
  index?: number;
  title: string;
  url: string;
  duration: number;
  thumbnail: string;
  playlist?: string;
  author?: Author;
}

export interface Queue {
  lastAddedIndex: number;
  songs: Song[];
}
