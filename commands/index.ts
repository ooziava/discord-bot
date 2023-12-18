import { dirname, resolve } from "path";
import { readdirSync } from "fs";

const __filename = require.main!.filename;
const __dirname = dirname(__filename);

const getCommands = async (): Promise<Command[]> =>
  await Promise.all(
    readdirSync(resolve(__dirname))
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
