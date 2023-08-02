import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Interaction,
} from "discord.js";
import dotenv from "dotenv";
import { Bot, Command } from "interfaces/discordjs";
import loadEvents from "./utils/loadEvents.js";
import loadCommands from "./utils/loadCommands.js";
import checkRequires from "./requirements";
import registerCommands from "./utils/registerCommands.js";
import { getFreeClientID, setToken } from "play-dl";

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
const bot: Bot = {
  client,
  commands,
  subscriptions: new Map(),
};

const onCommand = async (interaction: Interaction) => {
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction, bot);
    } catch (error) {
      console.error(error);

      const reply =
        interaction.replied || interaction.deferred
          ? interaction.followUp
          : interaction.reply;
      await reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
    // respond to the button
  } else if (interaction.isStringSelectMenu()) {
    // respond to the select menu
  }
};

client.login(process.env.DISCORD_TOKEN);

const SocialAuth = async () => {
  client.login(process.env.DISCORD_TOKEN);

  try {
    const clientID = await getFreeClientID();
    await setToken({
      soundcloud: {
        client_id: clientID,
      },
      spotify: {
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
        market: process.env.SPOTIFY_MARKET!,
      },
    });
    console.log("Token set!");
  } catch (error) {
    console.error(error);
  }
};

client.once(Events.ClientReady, async (c) => {
  commands = await loadCommands();
  await loadEvents(client, commands);
  await registerCommands(commands);
  client.on(Events.InteractionCreate, onCommand);
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

SocialAuth();

export default bot;
