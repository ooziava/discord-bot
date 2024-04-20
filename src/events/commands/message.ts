import { Events, Message } from "discord.js";

import GuildService from "../../services/guild.js";
import { checkCooldown, messageErrorHandler } from "../../utils/index.js";

import type MyClient from "../../client.js";

export const name = Events.MessageCreate;
export const execute = async (client: MyClient, message: Message) => {
  if (message.author.bot || !message.inGuild()) return;

  let prefix = client.prefixes.get(message.guildId);
  if (!prefix) {
    const guild = await GuildService.getGuild(message.guildId);
    client.prefixes.set(message.guildId, guild.prefix);
    prefix = guild.prefix;
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift();
  if (!commandName) return;

  const command = client.commands.get(commandName);
  if (!command) return;

  const cooldown = await checkCooldown(client, message.author.id, command);
  if (cooldown) {
    return await message.reply({
      content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${cooldown}:R>.`,
    });
  }

  await messageErrorHandler(message, async () => {
    await command.execute(client, message, args);
  });
};
