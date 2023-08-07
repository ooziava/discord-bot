import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
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
client.once(Events.ClientReady, async (c) => {
    await socialAuth();
    bot.commands = await loadCommands();
    c.on(Events.InteractionCreate, commandHandler);
    await registerCommands(bot.commands);
    console.log(`Ready! Logged in as ${c.user.tag}`);
});
const bot = {
    client,
    commands: new Collection(),
    interactions: new Collection(),
    subscriptions: new Collection(),
    activeMessages: new Collection(),
    players: new Collection(),
    playersOptions: new Collection(),
    songs: new Collection(),
    songAttributes: new Collection(),
};
client.login(process.env.DISCORD_TOKEN);
export default bot;
