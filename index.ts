import consola from "consola";
import { Client, Collection, Events, GatewayIntentBits, type Interaction } from "discord.js";
import type { PlayerSubscription } from "@discordjs/voice";

import registerCommands from "./utils/register-commands.js";
import getCommands from "./commands/index.js";
import login from "./utils/login.js";
import notrack from "./components/notrack.js";

export class MyClient extends Client {
  commands = new Collection<string, Command>();
  interactions = new Collection<string, Interaction>();
  subscriptions = new Collection<string, PlayerSubscription>();
  cooldowns = new Collection<string, Collection<string, number>>();
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

client.once(Events.ClientReady, async (c) => {
  try {
    consola.info("Loading commands...");
    const commands = await getCommands();
    consola.success("Commands loaded!");

    consola.info("Starting command registration...");
    commands.forEach((command) => {
      client.commands.set(command.data.name, command);
    });

    // await registerCommands(commands);
    // consola.success("Commands registered!");

    consola.info("Logging in to services...");
    await login();
    consola.success("Logged in to services!");
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }

  consola.success(`Ready! Logged in as ${c.user.username}`);
});

client.on(Events.Error, (error) => {
  consola.error(error);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const [commandName, commandType] = interaction.commandName.split("_");
  if (process.env.NODE_ENV != "development" && commandType === "dev") return;

  interaction.commandName = commandName;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        embeds: [notrack("There was an error while executing this command!")],
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        embeds: [notrack("There was an error while executing this command!")],
        ephemeral: true,
      });
    }
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
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            embeds: [
              notrack(
                `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
                  command.data.name
                }\` command.`
              ),
            ],
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            embeds: [
              notrack(
                `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
                  command.data.name
                }\` command.`
              ),
            ],
            ephemeral: true,
          });
        }
        return;
      }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  }

  try {
    await command.execute(interaction, client);
    consola.info(interaction.commandName + " command executed!");
  } catch (error) {
    consola.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        embeds: [notrack("There was an error while executing this command!")],
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        embeds: [notrack("There was an error while executing this command!")],
        ephemeral: true,
      });
    }
  }
});

consola.start("Logging in...");
client
  .login(process.env.RESET_TOKEN)
  .then(() => {
    consola.log("Logged in!");
  })
  .catch((error) => {
    consola.error("Failed to login!");
    consola.fatal(error);
    process.exit(1);
  });
