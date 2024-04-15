import { Events, type Interaction } from "discord.js";
import consola from "consola";
import type MyClient from "../../client.js";
import replies from "../../data/replies.json" assert { type: "json" };

export const name = Events.InteractionCreate;
export const execute = async (client: MyClient, interaction: Interaction) => {
  if (!interaction.isStringSelectMenu() || !interaction.inGuild()) return;

  const action = client.customActions.get(interaction.customId);
  if (!action) return consola.error(`No command matching ${interaction.customId} was found.`);

  try {
    await action.execute(interaction);
  } catch (error) {
    consola.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replies.commandError);
    } else {
      await interaction.reply(replies.commandError);
    }
  }
};
