import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { type Command } from "interfaces/discordjs";
import { clearQueue } from "../../services/queue.js";
import { confirmationRow } from "../../utils/actionBuilder.js";
import { createConfirmarion } from "../../utils/actionHandlers.js";

const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Clears the queue");

const execute = async (interaction: CommandInteraction): Promise<void> => {
  const row = confirmationRow();
  const response = await interaction.reply({
    content: "Are you sure you want to clear the queue?",
    components: [row],
  });

  await createConfirmarion(interaction, response, async (confirmation) => {
    clearQueue(interaction.guildId!);
    await confirmation.update({
      content: "Queue cleared",
      components: [],
    });
  });
};

export const command: Command = {
  data,
  execute,
};
