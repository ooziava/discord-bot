// Require the necessary discord.js classes

import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

import { type Bot, type Command } from "interfaces/discordjs";
import loadEvents from "./utils/loadEvents.js";
import loadCommands from "./utils/loadCommands.js";
import registerCommands from "./utils/registerCommands.js";
dotenv.config();

// Create a new client instance
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

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async (c) => {
  commands = await loadCommands();
  await loadEvents(client, commands);
  await registerCommands(commands);
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, bot);
  } catch (error: any) {
    console.error(error);
    if (error.code === "InteractionNotReplied") {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  }
});
// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

const bot: Bot = {
  client,
  commands,
  subscriptions: new Map(),
};

export default bot;
