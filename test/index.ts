import { generateDependencyReport } from "@discordjs/voice";
import bot from "../index.js";

console.log("bot.commands :>> ", bot.commands);
setTimeout(() => {
  console.log("bot.commands :>> ", bot.commands);
  console.log(generateDependencyReport());
}, 5000);
