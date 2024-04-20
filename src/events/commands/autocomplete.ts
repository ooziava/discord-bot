import { Events, type Interaction } from "discord.js";

import { interactionErrorHandler } from "../../utils/error-handlers.js";

import type MyClient from "../../client.js";

export const name = Events.InteractionCreate;
export const execute = async (client: MyClient, interaction: Interaction) => {
  if (!interaction.isAutocomplete() || !interaction.inGuild()) return;

  const command = client.commands.get(interaction.commandName);
  await interactionErrorHandler(interaction, async () => {
    if (command && command.autocomplete) await command.autocomplete(interaction);
  });
};
