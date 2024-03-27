import type { PlayerSubscription } from "@discordjs/voice";
import { Client, Collection, Events, GatewayIntentBits, type Interaction } from "discord.js";
import consola from "consola";

import getCommands from "./commands/index.js";
import loginToSocial from "./utils/login.js";
import { connectToDB } from "./utils/mongo.js";
import registerCommands from "./utils/register-commands.js";

export class MyClient extends Client {
  commands = new Collection<string, Command>();
  timers = new Collection<string, NodeJS.Timeout>();
  cooldowns = new Collection<string, Collection<string, number>>();
  currentSongs = new Collection<string, StoredSong>();
  subscriptions = new Collection<string, PlayerSubscription>();
  // interactions = new Collection<string, Interaction>();
}

const client = new MyClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
});

client.once(Events.ClientReady, async (c) => {
  try {
    consola.info("Loading commands...");
    const commands = await getCommands();

    consola.info("Starting command registration...");
    commands.forEach((command) => {
      client.commands.set(command.data.name, command);
    });
    await registerCommands(commands);

    consola.info("Logging in to services...");
    await loginToSocial();
    await connectToDB();
    consola.success(`Ready! Logged in as ${c.user.username}`);
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }
});

client.on(Events.Error, consola.error);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const [commandName, commandType] = interaction.commandName.split("_");
  if (process.env.NODE_ENV != "development" && commandType === "dev") return;

  interaction.commandName = commandName;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    const noCommandReply = {
      content: "There no command with that name!",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) await interaction.followUp(noCommandReply);
    else await interaction.reply(noCommandReply);
    return consola.error(`Command ${interaction.commandName} not found!`);
  } else if (command.cooldown) {
    const commandName = command.data.name;
    if (!client.cooldowns.has(commandName)) client.cooldowns.set(commandName, new Collection());

    const now = Date.now();
    const timestamps = client.cooldowns.get(commandName)!;
    const cooldownAmount = (command.cooldown ?? 3) * 1000;
    const userId = interaction.user.id;
    if (timestamps.has(userId)) {
      const expirationTime = timestamps.get(userId)! + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        const timeLeftReply = {
          content: `Please wait ${timeLeft.toFixed(
            1
          )} more second(s) before reusing the \`${commandName}\` command.`,
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) await interaction.followUp(timeLeftReply);
        else await interaction.reply(timeLeftReply);
        return consola.info(`User ${userId} is on cooldown for command ${commandName}`);
      }
    }
    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);
  }

  try {
    await command.execute(interaction, client);
  } catch (error: any) {
    consola.error(error);
    const errorReply = {
      content: error?.message,
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) await interaction.followUp(errorReply);
    else await interaction.reply(errorReply);
  }
});

consola.start("Logging in...");
client.login(process.env.RESET_TOKEN).catch(consola.error);
