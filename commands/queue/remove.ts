import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";

import { type Command } from "interfaces/discordjs";
import { getSong, removeSongFromQueue } from "../../services/queue.js";
import { confirmationRow } from "../../utils/actionBuilder.js";
import { createConfirmarion } from "../../utils/actionHandlers.js";

const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Removes a song from the queue")
  .addStringOption((option) =>
    option
      .setName("index")
      .setDescription("The index of the song to remove")
      .setRequired(true)
      .setMaxLength(4)
      .setMinLength(1)
  );

const execute = async (interaction: CommandInteraction): Promise<void> => {
  const prompt = (interaction.options as CommandInteractionOptionResolver)
    .getString("index")!
    .match(/\d+/)?.[0];

  const index = parseInt(prompt!) - 1;
  if (isNaN(index)) {
    await interaction.reply({
      content: "Invalid index",
      ephemeral: true,
    });
    return;
  }

  const song = getSong(interaction.guildId!, index);
  if (!song) {
    await interaction.reply({
      content: "Song not found",
      ephemeral: true,
    });
    return;
  }

  const row = confirmationRow();
  const response = await interaction.reply({
    content: `Are you sure you want to remove ${song.title}  from the queue?`,
    components: [row],
  });

  await createConfirmarion(interaction, response, async (confirmation) => {
    removeSongFromQueue(interaction.guildId!, index);
    await confirmation.update({
      content: `Removed ${song.title} from the queue`,
      components: [],
    });
  });
};

export const command: Command = {
  data,
  execute,
};
