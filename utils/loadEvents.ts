// import fs from "node:fs";
// import path from "node:path";
// import { fileURLToPath } from "node:url";
import { Client, Events } from "discord.js";
import { type Commands } from "interfaces/discordjs";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async (client: Client, commands: Commands): Promise<void> => {
  // const foldersPath = path.join(__dirname, "../events");
  // const commandFolders = fs.readdirSync(foldersPath);
  // for (const folder of commandFolders) {
  //   const commandsPath = path.join(foldersPath, folder);
  //   const commandFiles = fs
  //     .readdirSync(commandsPath)
  //     .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
  //   for (const file of commandFiles) {
  //     const filePath = path.join(commandsPath, file);
  //     const eventList: object = await import(`file://${filePath}`);
  //     for (const event of Object.values(eventList)) {
  //       if (event.once) {
  //         client.once(event.name, (...args) => event.execute(client, ...args));
  //       } else {
  //         client.on(event.name, (...args) => event.execute(client, ...args));
  //       }
  //     }
  //   }
  // }
};
