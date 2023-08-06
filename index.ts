import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import express from "express";

import { type Bot, type Command } from "interfaces/discordjs";
import loadCommands from "./utils/loadCommands.js";
import registerCommands from "./utils/registerCommands.js";
import commandHandler from "./utils/commandHandlers.js";
import socialAuth from "./utils/socialAuth.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
});

let commands = new Collection<string, Command>();

client.once(Events.ClientReady, async (c) => {
  await socialAuth();
  commands = await loadCommands();
  bot.commands = commands;

  c.on(Events.InteractionCreate, (interaction) => {
    commandHandler(interaction, bot);
  });

  await registerCommands(commands);
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

const bot: Bot = {
  client,
  commands,
  activeMessageIds: new Collection(),
  songAttributes: new Collection(),
  subscriptions: new Collection(),
  interactions: new Collection(),
  currentSong: new Collection(),
};

client.login(process.env.DISCORD_TOKEN);
export default bot;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
