import { REST, Routes } from "discord.js";
import { Command, Commands } from "interfaces/discordjs";
import dotenv from "dotenv";

dotenv.config();
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

export default async (commandCollection: Commands): Promise<void> => {
  const commands: Command[] = [];
  commandCollection.forEach((commandItem) =>
    commands.push(commandItem.data.toJSON())
  );
  console.log(
    `Started refreshing ${commands.length} application (/) commands.`
  );

  try {
    const data = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!
      ),
      { body: commands }
    )) as unknown as Array<unknown>;

    // (await rest.put(
    //   Routes.applicationGuildCommands(
    //     process.env.CLIENT_ID!,
    //     process.env.SUBGUILD_ID!
    //   ),
    //   { body: commands }
    // )) as unknown as Array<unknown>;

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
};
