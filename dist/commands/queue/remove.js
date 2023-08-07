import { SlashCommandBuilder } from "@discordjs/builders";
import { getSongByIndex, removeSong } from "../../services/queue.js";
import { confirmationRow } from "../../utils/actionBuilder.js";
import { createConfirmation } from "../../utils/actionHandlers.js";
const data = new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Removes a song from the queue")
    .addStringOption((option) => option
    .setName("index")
    .setDescription("The index of the song to remove")
    .setRequired(true));
const execute = async (interaction) => {
    const prompt = interaction.options
        .getString("index")
        .match(/\d+/)?.[0];
    const index = parseInt(prompt) - 1;
    if (isNaN(index)) {
        await interaction.reply({
            content: "Invalid index",
            ephemeral: true,
        });
        return;
    }
    const song = getSongByIndex(interaction.guildId, index);
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
    await createConfirmation(interaction, response, async (confirmation) => {
        removeSong(interaction.guildId, index);
        await confirmation.update({
            content: `Removed ${song.title} from the queue`,
            components: [],
        });
    });
};
export const command = {
    data,
    execute,
    voice: false,
};
