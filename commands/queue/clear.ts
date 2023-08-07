import { SlashCommandBuilder } from "@discordjs/builders";

import { type Execute, type Command } from "interfaces/discordjs";
import { clearQueue } from "../../services/queue.js";
import { confirmationRow } from "../../utils/actionBuilder.js";
import { createConfirmation } from "../../utils/actionHandlers.js";

const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Clears the queue");

const execute: Execute = async (interaction) => {
  const row = confirmationRow();
  const response = await interaction.reply({
    content: "Are you sure you want to clear the queue?",
    components: [row],
  });

  await createConfirmation(interaction, response, async (confirmation) => {
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
  voice: false,
};
