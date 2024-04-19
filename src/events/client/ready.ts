import consola from "consola";
import { Events } from "discord.js";

import type MyClient from "../../client.js";
import GuildService from "../../services/guild.js";

export const name = Events.ClientReady;
export const once = true;
export const execute = async (client: MyClient) => {
  const prefixes = await GuildService.getPrefixes();
  prefixes.forEach(({ prefix, guildId }) => {
    client.prefixes.set(guildId, prefix);
  });
  consola.success("Prefixes loaded!");
  consola.success(`Ready! Logged in as ${client.user.tag}`);
};
