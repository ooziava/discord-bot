import { Events } from "discord.js";
import type MyClient from "../../utils/client.js";

export const name = Events.ClientReady;
export const once = true;
export const execute = (client: MyClient) => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
};
