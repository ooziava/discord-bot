import { Client, Collection, type ClientOptions } from "discord.js";
import readFolders from "./utils/read-folders.js";
import consola from "consola";
import connectToDB from "./mongo.js";

class MyClient extends Client<true> {
  commands: Collection<string, any>;
  cooldowns: Collection<string, Collection<string, number>>;
  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.cooldowns = new Collection();

    const commandPromises = readFolders("../commands").map(async (filePath) => {
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
      } else {
        consola.warn(
          `The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    });

    const eventPromises = readFolders("../events").map(async (filePath) => {
      const event = await import(filePath);
      if ("name" in event && "execute" in event) {
        if (event.once) {
          this.once(event.name, (...args) => event.execute(this, ...args));
        } else {
          this.on(event.name, (...args) => event.execute(this, ...args));
        }
      } else {
        consola.warn(
          `The event at ${filePath} is missing a required "name" or "execute" property.`
        );
      }
    });

    Promise.all(commandPromises).then(() => {
      consola.success("Commands loaded");
    });
    Promise.all(eventPromises).then(() => {
      consola.success("Events loaded");
    });
    connectToDB().then(() => {
      consola.success("Connected to MongoDB");
    });
  }
}

export default MyClient;
