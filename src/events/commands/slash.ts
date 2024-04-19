import { Events, type Interaction } from "discord.js";
import consola from "consola";

import { checkCooldown } from "../../utils/cooldowns.js";

import replies from "../../data/replies.json" assert { type: "json" };

import type MyClient from "../../client.js";

export const name = Events.InteractionCreate;
export const execute = async (client: MyClient, interaction: Interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.inGuild()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return consola.error(`No command matching ${interaction.commandName} was found.`);

  const cooldown = await checkCooldown(client, interaction.user.id, command);
  if (cooldown) {
    return await interaction.reply({
      content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${cooldown}:R>.`,
      ephemeral: true,
    });
  }

  try {
    await command.execute(client, interaction);
  } catch (error) {
    consola.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replies.commandError);
    } else {
      await interaction.reply(replies.commandError);
    }
  }
};
