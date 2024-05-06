import consola from "consola";
import { GatewayIntentBits } from "discord.js";

import MyClient from "./client.js";
import { readFolders } from "./utils/read-folders.js";

import "./utils/login-socials.js";
import "./mongo.js";
import "./models/index.js";

const token = process.env.RESET_TOKEN;
if (!token) {
  consola.error("Missing RESET_TOKEN environment variable");
  process.exit(1);
}
if (process.env.NODE_ENV != "development") {
  import("./utils/generate-dependency-report.js");
  import("./utils/deploy-commands.js");
}

const client = new MyClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    // GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    // GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
});

Promise.all(
  readFolders("./commands", import.meta.url).map(async (filePath) => {
    const command = await import(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      const aliases = command.aliases;
      if (aliases) {
        if (typeof aliases === "string") {
          client.commands.set(aliases, command);
        } else if (Array.isArray(aliases)) {
          aliases.forEach((alias) => {
            client.commands.set(alias, command);
          });
        }
      }
      return true;
    } else {
      consola.warn(
        `The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  })
).then((res) => {
  consola.success(`${res.filter((el) => !!el).length} commands loaded`);
});

Promise.all(
  readFolders("./events", import.meta.url).map(async (filePath) => {
    const event = await import(filePath);
    if ("name" in event && "execute" in event) {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
      } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
      }
      return true;
    } else {
      consola.warn(`The event at ${filePath} is missing a required "name" or "execute" property.`);
    }
  })
).then((res) => {
  consola.success(`${res.filter((el) => !!el).length} events loaded`);
});

process.on("unhandledRejection", (reason, promise) => {
  consola.error("Unhandled Rejection at:", promise, "\nreason:", reason);
});

client.login(token);
