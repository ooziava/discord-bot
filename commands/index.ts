import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getCommands = async (): Promise<Command[]> =>
  await Promise.all(
    readdirSync(resolve(__dirname))
      .filter((file) => file !== "index.ts" && (file.endsWith(".js") || file.endsWith(".ts")))
      .map(async (file) => {
        const command = await import(`./${file}`);
        return { ...command };
      })
  );

export default getCommands;
