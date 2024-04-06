import fs from "fs";
import path from "path";

const readFiles = (commandsPath: string) =>
  fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"))
    .map((file) => {
      const filePath = path.join(commandsPath, file);
      const fileUrl = new URL(`file://${filePath}`);
      return fileUrl.toString();
    });

export default readFiles;
