import { ButtonInteraction, SlashCommandBuilder } from "discord.js";

import { type Command, type Execute } from "interfaces/discordjs";
import { createSongListUpdater } from "../../utils/queueMessage.js";
import { paginationRow } from "../../utils/actionBuilder.js";
import { createPagination } from "../../utils/actionHandlers.js";

const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Shows the list of songs");

const execute: Execute = async (interaction) => {
  const updateSongList = createSongListUpdater(interaction);
  let message = updateSongList();

  const row = paginationRow();
  const response = await interaction.reply({
    content: message,
    components: [row],
    ephemeral: true,
  });

  const nextPage = async (confirmation: ButtonInteraction) => {
    message = updateSongList("next");
    await confirmation.update({
      content: message,
      components: [row],
    });
  };

  const previousPage = async (confirmation: ButtonInteraction) => {
    message = updateSongList("prev");
    await confirmation.update({
      content: message,
      components: [row],
    });
  };
  await createPagination(interaction, response, nextPage, previousPage);
};

export const command: Command = {
  data,
  execute,
  voice: false,
};
