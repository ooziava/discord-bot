import consola from "consola";
import { REST, Routes } from "discord.js";

const token = process.env.RESET_TOKEN;
const clientId = process.env.CLIENT_ID;
const serverId = process.env.SERVER_ID;

if (!token || !clientId || !serverId) throw new Error("Missing environment variables");

const rest = new REST().setToken(token);

export default async (commandCollection: Command[]) => {
  consola.info("Formatting commands...");
  if (!commandCollection.length) throw new Error("No commands found");
  const commands =
    process.env.NODE_ENV === "development"
      ? commandCollection.map((commandItem) => {
          return {
            ...commandItem.data.toJSON(),
            name: commandItem.data.name + "_dev",
          };
        })
      : commandCollection.map((commandItem) => commandItem.data.toJSON());

  const method =
    process.env.NODE_ENV === "development"
      ? Routes.applicationGuildCommands(clientId, serverId)
      : Routes.applicationCommands(clientId);

  consola.info("Clearing commands...");
  await rest.put(method, { body: [] });

  consola.info("Registering commands...");
  const data = (await rest.put(method, { body: commands })) as any[];

  consola.success(`Successfully reloaded ${data.length} application (/) commands.`);
};
