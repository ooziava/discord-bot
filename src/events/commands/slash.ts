import { Events, type Interaction } from "discord.js";

import { checkCooldown, interactionErrorHandler } from "../../utils/index.js";

import type MyClient from "../../client.js";

export const name = Events.InteractionCreate;
export const execute = async (client: MyClient, interaction: Interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.inGuild()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const cooldown = await checkCooldown(client, interaction.user.id, command);
  if (cooldown) {
    await interaction.reply({
      content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${cooldown}:R>.`,
      ephemeral: true,
    });
    return;
  }

  await interactionErrorHandler(interaction, async () => {
    await command.execute(client, interaction);
  });
};
