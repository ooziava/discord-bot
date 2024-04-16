import { Events, type Interaction } from "discord.js";
import consola from "consola";
import type MyClient from "../../client.js";

export const name = Events.InteractionCreate;
export const execute = async (client: MyClient, interaction: Interaction) => {
  if (!interaction.isAutocomplete() || !interaction.inGuild()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command || !command.autocomplete)
    return consola.error(
      `Command ${interaction.commandName} does not have an autocomplete function.`
    );

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    consola.error(error);
  }
};
