import { generateDependencyReport } from "@discordjs/voice";

process.env.NODE_ENV != "development" && console.log(generateDependencyReport());
