import { Events, type Interaction } from "discord.js";

import { interactionErrorHandler } from "../../utils/error-handlers.js";

import type MyClient from "../../client.js";

export const name = Events.InteractionCreate;
export const execute = async (client: MyClient, interaction: Interaction) => {
  if (!interaction.isStringSelectMenu() || !interaction.inGuild()) return;

  const action = client.customActions.get(interaction.customId);
  if (action)
    return await interactionErrorHandler(interaction, async () => {
      await action.execute(interaction);
    });
};
