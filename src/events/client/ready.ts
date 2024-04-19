import consola from "consola";
import { Events } from "discord.js";

import type MyClient from "../../client.js";

export const name = Events.ClientReady;
export const once = true;
export const execute = (client: MyClient) => {
  consola.success(`Ready! Logged in as ${client.user.tag}`);
};
