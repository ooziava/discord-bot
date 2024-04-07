import { Events } from "discord.js";
import consola from "consola";
import type MyClient from "../../utils/client.js";

export const name = Events.ClientReady;
export const once = true;
export const execute = (client: MyClient) => {
  consola.success(`Ready! Logged in as ${client.user.tag}`);
};
