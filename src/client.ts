import consola from "consola";
import { Client, Collection, type ClientOptions } from "discord.js";
import type { AudioPlayer } from "@discordjs/voice";

import { readFolders } from "./utils/read-folders.js";

import type { Command, Action } from "./types/index.js";

export default class MyClient extends Client<true> {
  commands: Collection<string, Command>;
  cooldowns: Collection<string, Collection<string, number>>;
  customActions: Collection<string, Action>;
  players: Collection<string, AudioPlayer>;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.customActions = new Collection();
    this.players = new Collection();

    const commandPromises = readFolders("./commands", import.meta.url).map(async (filePath) => {
      const command = await import(filePath);
      if ("data" in command && "execute" in command) {
        this.commands.set(command.data.name, command);
        const aliases = command.aliases;
        if (aliases) {
          if (typeof aliases === "string") {
            this.commands.set(aliases, command);
          } else if (Array.isArray(aliases)) {
            aliases.forEach((alias) => {
              this.commands.set(alias, command);
            });
          }
        }
        return true;
      } else {
        consola.warn(
          `The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    });

    const eventPromises = readFolders("./events", import.meta.url).map(async (filePath) => {
      const event = await import(filePath);
      if ("name" in event && "execute" in event) {
        if (event.once) {
          this.once(event.name, (...args) => event.execute(this, ...args));
        } else {
          this.on(event.name, (...args) => event.execute(this, ...args));
        }
        return true;
      } else {
        consola.warn(
          `The event at ${filePath} is missing a required "name" or "execute" property.`
        );
      }
    });

    // const actionPromises = readFolders("./actions", import.meta.url).map(async (filePath) => {
    //   const action = await import(filePath);
    //   if ("name" in action && "execute" in action) {
    //     this.customActions.set(action.name, action);
    //     return true;
    //   } else {
    //     consola.warn(
    //       `The action at ${filePath} is missing a required "name" or "execute" property.`
    //     );
    //   }
    // });

    Promise.all(commandPromises).then((res) => {
      consola.success(`${res.filter((el) => !!el).length} commands loaded`);
    });
    Promise.all(eventPromises).then((res) => {
      consola.success(`${res.filter((el) => !!el).length} events loaded`);
    });
    // Promise.all(actionPromises).then((res) => {
    //   consola.success(`${res.filter((el) => !!el).length} actions loaded`);
    // });
  }
}
