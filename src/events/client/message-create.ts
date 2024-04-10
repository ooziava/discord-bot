import { Events, Message } from "discord.js";
import consola from "consola";
import type MyClient from "../../utils/client.js";
import replies from "../../data/replies.json" assert { type: "json" };
import GuildService from "../../services/guild.js";

export const name = Events.MessageCreate;
export const execute = async (client: MyClient, message: Message) => {
  if (message.author.bot || !message.guildId) return;
  const prefix = (await GuildService.init(message.guildId)).getPrefix();
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift();
  if (!commandName) return;

  const command = client.commands.get(commandName);
  if (!command) return consola.error(`No command matching ${commandName} was found.`);

  try {
    await command.execute(message, args);
  } catch (error) {
    consola.error(error);
    await message.reply(replies.commandError);
  }
};
