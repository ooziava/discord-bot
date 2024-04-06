import { Collection, Events, type Interaction } from "discord.js";
import consola from "consola";
import type MyClient from "../../utils/client.js";
import replies from "../../data/replies.json" assert { type: "json" };

export const name = Events.InteractionCreate;
export const execute = async (interaction: Interaction) => {
  const client = interaction.client as MyClient;
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return consola.error(`No command matching ${interaction.commandName} was found.`);

  const cooldowns = client.cooldowns;
  if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name)!;
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;
  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      return interaction.reply({
        content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
        ephemeral: true,
      });
    }
  }
  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  try {
    await command.execute(interaction);
  } catch (error) {
    consola.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replies.commandError);
    } else {
      await interaction.reply(replies.commandError);
    }
  }
};
