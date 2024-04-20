import { Client, Collection } from "discord.js";

import type { Command } from "./types/index.js";
import type { AudioPlayer } from "@discordjs/voice";

export default class MyClient extends Client<true> {
  commands: Collection<string, Command> = new Collection();
  cooldowns: Collection<string, Collection<string, number>> = new Collection();
  prefixes: Collection<string, string> = new Collection();
  players: Collection<string, AudioPlayer> = new Collection();
}
