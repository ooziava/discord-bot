import type { Interaction, Message } from "discord.js";

export async function interactionErrorHandler(
  interaction: Interaction,
  callback: () => Promise<any>
) {
  try {
    return await callback();
  } catch (error) {
    console.error(error);
    if (!interaction.isAutocomplete()) {
      if (interaction.deferred || interaction.replied) {
        return await interaction.followUp({
          content: "There was an error while executing this command.",
          ephemeral: true,
        });
      }
    }
  }
}

export async function messageErrorHandler(message: Message, callback: () => Promise<any>) {
  try {
    return await callback();
  } catch (error) {
    console.error(error);
    return await message.reply("There was an error while executing this command.");
  }
}
