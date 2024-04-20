import type { Interaction, Message } from "discord.js";

export async function interactionErrorHandler(
  interaction: Interaction,
  callback: () => Promise<void>
) {
  try {
    await callback();
  } catch (error) {
    console.error(error);
    try {
      if (!interaction.isAutocomplete()) {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: "There was an error while executing this command.",
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export async function messageErrorHandler(message: Message, callback: () => Promise<any>) {
  try {
    await callback();
  } catch (error) {
    console.error(error);
    try {
      await message.reply("There was an error while executing this command.");
    } catch (error) {
      console.error(error);
    }
  }
}
