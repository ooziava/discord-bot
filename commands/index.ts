import { dirname, resolve } from "path";
import { readdirSync } from "fs";

const filename = require.main!.filename;
const dirName = dirname(filename);

const getCommands = async (): Promise<Command[]> =>
  await Promise.all(
    readdirSync(resolve(dirName))
      .filter(
        (file) =>
          file !== "index.ts" &&
          file !== "index.js" &&
          (file.endsWith(".js") || file.endsWith(".ts"))
      )
      .map(async (file) => {
        const command = await import(`./${file}`);
        return { ...command };
      })
  );

export default getCommands;
