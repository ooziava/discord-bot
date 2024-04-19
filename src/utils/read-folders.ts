import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { readFiles } from "./read-files.js";

export function readFolders(parentFolder: string, metaUrl: string) {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);

  const foldersPath = join(__dirname, parentFolder);
  const commandFolders = readdirSync(foldersPath);
  const commands: string[] = [];
  commandFolders.forEach((folder) => {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readFiles(commandsPath);
    commands.push(...commandFiles);
  });
  return commands;
}
