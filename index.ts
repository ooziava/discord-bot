import consola from "consola";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

import registerCommands from "./register-commands.js";
import commands from "./commands/index.js";
import login from "./login.js";
import "./mongo.js";

export class MyClient extends Client {
  commands = new Collection<string, Command>();
}

const client = new MyClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.DirectMessageReactions,
  ],
});

client.once(Events.ClientReady, (c) => {
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }
  registerCommands(commands);
  login();
  consola.start(`Ready! Logged in as ${c.user.username}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
    consola.error(`Command ${interaction.commandName} not found!`);
    return;
  }
  try {
    command.execute(interaction, client);
  } catch (error) {
    consola.error(error);
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
});

client.login(process.env.TOKEN!).catch((error) => {
  consola.fatal(error);
  process.exit(1);
});
