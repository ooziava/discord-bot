import { GatewayIntentBits } from "discord.js";
import MyClient from "./client.js";
import "./utils/generate-dependency-report.js";
import "./mongo.js";

const token = process.env.REFRESH_TOKEN;
if (!token) {
  console.error("Missing required environment variable");
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
