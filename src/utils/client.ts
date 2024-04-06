import { Client, Collection, type ClientOptions } from "discord.js";
import readFolders from "./read-folders.js";
import consola from "consola";

export default class MyClient extends Client<true> {
  commands: Collection<string, any>;
  cooldowns: Collection<string, Collection<string, number>>;
  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.cooldowns = new Collection();

    readFolders("../commands").forEach((filePath) => {
      import(filePath).then((command) => {
        if ("data" in command && "execute" in command) {
          this.commands.set(command.data.name, command);
        } else {
          consola.warn(
            `The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      });
    });

    readFolders("../events").forEach((filePath) => {
      import(filePath).then((event) => {
        if ("name" in event && "execute" in event) {
          if (event.once) {
            this.once(event.name, (...args) => event.execute(...args));
          } else {
            this.on(event.name, (...args) => event.execute(...args));
          }
        } else {
          consola.warn(
            `The event at ${filePath} is missing a required "name" or "execute" property.`
          );
        }
      });
    });
  }
}
