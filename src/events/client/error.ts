import { Events } from "discord.js";
import consola from "consola";
import type MyClient from "../../client.js";

export const name = Events.Error;
export const once = true;
export const execute = (client: MyClient, error: any) => {
  consola.error(error);
};
