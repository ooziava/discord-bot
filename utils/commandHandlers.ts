import { Interaction } from "discord.js";
import { type Bot } from "interfaces/discordjs";

export default async (interaction: Interaction, bot: Bot): Promise<void> => {
  if (interaction.isCommand()) {
    const command = bot.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction, bot);
    } catch (error) {
      console.error(error);

      const reply =
        interaction.replied || interaction.deferred
          ? interaction.followUp
          : interaction.reply;
      await reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
    // respond to the button
  } else if (interaction.isStringSelectMenu()) {
    // respond to the select menu
  }
};
