import { SlashCommandBuilder } from "discord.js";
import { createSongListUpdater } from "../../utils/queueMessage.js";
import { paginationRow } from "../../utils/actionBuilder.js";
import { createPagination } from "../../utils/actionHandlers.js";
const data = new SlashCommandBuilder()
    .setName("list")
    .setDescription("Shows the list of songs");
const execute = async (interaction) => {
    const updateSongList = createSongListUpdater(interaction);
    let message = updateSongList();
    const row = paginationRow();
    const response = await interaction.reply({
        content: message,
        components: [row],
        ephemeral: true,
    });
    const nextPage = async (confirmation) => {
        message = updateSongList("next");
        await confirmation.update({
            content: message,
            components: [row],
        });
    };
    const previousPage = async (confirmation) => {
        message = updateSongList("prev");
        await confirmation.update({
            content: message,
            components: [row],
        });
    };
    await createPagination(interaction, response, nextPage, previousPage);
};
export const command = {
    data,
    execute,
    voice: false,
};
