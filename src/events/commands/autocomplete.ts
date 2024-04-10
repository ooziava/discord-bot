import { Events, type Interaction } from "discord.js";
import consola from "consola";
import type MyClient from "../../utils/client.js";

export const name = Events.InteractionCreate;
export const execute = async (client: MyClient, interaction: Interaction) => {
  if (!interaction.isAutocomplete()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return consola.error(`No command matching ${interaction.commandName} was found.`);

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    consola.error(error);
  }
};
