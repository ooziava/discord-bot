import { Events, Message } from "discord.js";
import consola from "consola";
import type MyClient from "../../client.js";
import replies from "../../data/replies.json" assert { type: "json" };
import GuildService from "../../services/guild.js";
import checkCooldown from "../../utils/cooldowns.js";

export const name = Events.MessageCreate;
export const execute = async (client: MyClient, message: Message) => {
  if (message.author.bot || !message.inGuild()) return;
  const prefix = (await GuildService.getGuild(message.guildId)).prefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift();
  if (!commandName) return;

  const command = client.commands.get(commandName);
  if (!command) return consola.error(`No command matching ${commandName} was found.`);

  const cooldown = await checkCooldown(client, message.author.id, command);
  if (cooldown) {
    return await message.reply({
      content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${cooldown}:R>.`,
    });
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    consola.error(error);
    await message.reply(replies.commandError);
  }
};
