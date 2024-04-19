import consola from "consola";
import { Events } from "discord.js";

import type MyClient from "../../client.js";

export const name = Events.Error;
export const once = true;
export const execute = (_client: MyClient, error: any) => {
  consola.error(error);
};
