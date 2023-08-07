import { REST, Routes, } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
export default async (commandCollection) => {
    const commands = [];
    commandCollection.forEach((commandItem) => commands.push(commandItem.data.toJSON()));
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    try {
        let data;
        if (process.env.DEV) {
            data = (await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands }));
        }
        else {
            data = (await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] }));
            (await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
                body: commands,
            }));
        }
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch (error) {
        console.error(error);
    }
};
