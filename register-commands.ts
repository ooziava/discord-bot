import consola from "consola";
import { REST, Routes } from "discord.js";

const rest = new REST().setToken(process.env.TOKEN!);

export default async (commandCollection: Command[]) => {
  if (!commandCollection.length) return;

  const commands = commandCollection.map((commandItem) => commandItem.data.toJSON());

  try {
    const data = (await rest.put(
      process.env.NODE_ENV === "development"
        ? Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.SERVER_ID!)
        : Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands }
    )) as any[];

    consola.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    consola.error(error);
  }
};
