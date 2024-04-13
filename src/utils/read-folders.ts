import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import readFiles from "./read-files.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readFolders(parentFolder: string) {
  const foldersPath = path.join(__dirname, parentFolder);
  const commandFolders = fs.readdirSync(foldersPath);
  const commands: string[] = [];
  commandFolders.forEach((folder) => {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = readFiles(commandsPath);
    commands.push(...commandFiles);
  });
  return commands;
}

export default readFolders;
