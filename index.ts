import consola from "consola";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import type { PlayerSubscription } from "@discordjs/voice";

import registerCommands from "./register-commands.js";
import commands from "./commands/index.js";
import login from "./login.js";

export class MyClient extends Client {
  songs = new Collection<string, Song>();
  commands = new Collection<string, Command>();
  cooldowns = new Collection<string, Collection<string, number>>();
  subscriptions = new Collection<string, PlayerSubscription>();
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
  consola.success(`Ready! Logged in as ${c.user.username}`);
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

  if (command.cooldown) {
    if (!client.cooldowns.has(command.data.name)) {
      client.cooldowns.set(command.data.name, new Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.data.name)!;
    const cooldownAmount = (command.cooldown ?? 3) * 1000;
    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        await interaction.reply({
          content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
            command.data.name
          }\` command.`,
          ephemeral: true,
        });
        return;
      }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
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

consola.start("Logging in...");
