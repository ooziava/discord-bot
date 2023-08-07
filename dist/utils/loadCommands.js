import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Collection } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default async () => {
    const commands = new Collection();
    try {
        const foldersPath = path.join(__dirname, "../commands");
        const commandFolders = fs.readdirSync(foldersPath);
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs
                .readdirSync(commandsPath)
                .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const commandFile = await import(`file://${filePath}`);
                const command = commandFile.command;
                if (command) {
                    console.log(`Loaded command ${command.data.name} at ${filePath}`);
                    process.env.DEV && command.data.setName(`${command.data.name}-dev`);
                    commands.set(command.data.name, command);
                }
                else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }
    catch (error) {
        console.error(error);
    }
    return commands;
};
