import consola from "consola";
import { GatewayIntentBits } from "discord.js";

import MyClient from "./client.js";

import "./utils/generate-dependency-report.js";
import "./utils/login-socials.js";
import "./mongo.js";
import "./models/index.js";

const token = process.env.RESET_TOKEN;
if (!token) {
  consola.error("Missing RESET_TOKEN environment variable");
  process.exit(1);
}
if (process.env.NODE_ENV != "development") import("./utils/deploy-commands.js");

const client = new MyClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
});
client.login(token);
