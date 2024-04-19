import consola from "consola";
import { REST, Routes } from "discord.js";

import { readFolders } from "./read-folders.js";

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.RESET_TOKEN;
const status = process.env.NODE_ENV != "development" ? "global" : "guild";

if (!clientId || !guildId || !token) {
  consola.error("Missing required environment variables.");
  process.exit(1);
}

const rest = new REST().setToken(token);
(async () => {
  try {
    const commands: any[] = [];
    const commandFiles = readFolders("../commands", import.meta.url);
    await Promise.all(
      commandFiles.map(async (file) => {
        const command = await import(file);
        commands.push(command.data.toJSON());
      })
    );

    consola.start(`Started refreshing ${commands.length} application (/) commands.`);
    const method =
      status === "global"
        ? Routes.applicationCommands(clientId)
        : Routes.applicationGuildCommands(clientId, guildId);

    if (status === "global")
      await rest.put(Routes.applicationCommands(clientId), {
        body: [],
      });

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [],
    });
    const data = (await rest.put(method, {
      body: commands,
    })) as any[];

    consola.success(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    consola.error(error);
  }
})();
