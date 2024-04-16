import fs from "fs";
import path from "path";

function readFiles(commandsPath: string) {
  const commandFiles: string[] = [];

  fs.readdirSync(commandsPath).forEach((file) => {
    const filePath = path.join(commandsPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      // If it's a directory, read the index file
      const indexFile = fs.readdirSync(filePath).find((f) => f === "index.ts" || f === "index.js");
      if (indexFile) {
        const fileUrl = new URL(`file://${path.join(filePath, indexFile)}`);
        commandFiles.push(fileUrl.toString());
      }
    } else if (file.endsWith(".js") || file.endsWith(".ts")) {
      // If it's a file, add it to the list
      const fileUrl = new URL(`file://${filePath}`);
      commandFiles.push(fileUrl.toString());
    }
  });

  return commandFiles;
}

export default readFiles;
