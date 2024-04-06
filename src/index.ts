import { GatewayIntentBits } from "discord.js";
import MyClient from "./utils/client.js";
import consola from "consola";

const token = process.env.DISCORD_TOKEN;
const client = new MyClient({ intents: [GatewayIntentBits.Guilds] });
client.login(token);
