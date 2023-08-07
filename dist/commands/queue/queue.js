import { SlashCommandBuilder, } from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";
import { getQueueLength, getSong, setCurrentSong, } from "../../services/queue.js";
import { play } from "../../services/play.js";
import { createSongListUpdater } from "../../utils/queueMessage.js";
import createConnection from "../../utils/createConnection.js";
import { paginationRow } from "../../utils/actionBuilder.js";
import { createPagination } from "../../utils/actionHandlers.js";
const data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows the current queue")
    .addStringOption((option) => option
    .setName("index")
    .setDescription("The index of the queue")
    .setMaxLength(5)
    .setMinLength(1));
const execute = async (interaction, bot) => {
    const prompt = interaction.options.getString("index");
    if (prompt) {
        const connection = createConnection(interaction);
        if (!connection)
            return;
        const index = prompt === "last"
            ? getQueueLength(interaction.guildId) - 1
            : prompt === "first"
                ? 0
                : parseInt(prompt) - 1;
        if (isNaN(index)) {
            await interaction.reply({
                content: "Invalid index",
                ephemeral: true,
            });
            return;
        }
        const song = getSong(interaction.guild.id, index);
        if (!song) {
            await interaction.reply({
                content: "Song not found",
                ephemeral: true,
            });
            return;
        }
        const player = createAudioPlayer();
        if (bot.subscriptions.has(interaction.guild.id)) {
            setCurrentSong(interaction.guild.id, index - 1)
                ? await interaction.reply({
                    content: `Next song: ${song.title}`,
                    ephemeral: true,
                })
                : await interaction.reply({
                    content: "Invalid index",
                    ephemeral: true,
                });
        }
        else {
            const subscription = connection.subscribe(player);
            if (!subscription) {
                await interaction.reply({
                    content: "Error connecting to audio",
                    ephemeral: true,
                });
                return;
            }
            bot.subscriptions.set(interaction.guild.id, subscription);
            bot.currentSong.set(interaction.guild.id, song);
            const isSetted = setCurrentSong(interaction.guild.id, index);
            if (!isSetted || !subscription) {
                await interaction.reply({
                    content: "Something went wrong!",
                    ephemeral: true,
                });
            }
            else {
                if (!bot.interactions.has(interaction.guild.id)) {
                    bot.interactions.set(interaction.guild.id, interaction);
                    await interaction.reply(`Now playing: ${song.title}`);
                }
                else
                    await interaction.reply({
                        content: `Now playing: ${song.title}`,
                        ephemeral: true,
                    });
                await play(interaction.guild.id, bot);
            }
        }
        return;
    }
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
};
