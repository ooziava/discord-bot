import { SlashCommandBuilder, } from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";
import { play } from "../../services/play.js";
import { findSong, getQueueLength, getSongByIndex, setCurrentSong, } from "../../services/queue.js";
import { createConnection } from "../../utils/createConnection.js";
import bot from "../../index.js";
const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .addStringOption((option) => option.setName("find").setDescription("Find song in queue"))
    .addStringOption((option) => option.setName("index").setDescription("Play song by index"));
const execute = async (interaction) => {
    const query = interaction.options.getString("find");
    let index = interaction.options.getString("index");
    if (!query && !index) {
        await interaction.reply("Please provide a query or index");
        return;
    }
    if (index && isNaN(parseInt(index))) {
        const length = getQueueLength(interaction.guildId);
        if (index.toLowerCase() === "random") {
            const randomIndex = Math.floor(Math.random() * (length - 1 - 0 + 1) + 0);
            index = randomIndex.toString();
        }
        else if (index.toLowerCase() === "last") {
            index = length.toString();
        }
        else {
            await interaction.reply("Index must be a number");
            return;
        }
    }
    const connection = createConnection(interaction);
    if (!connection)
        return;
    const song = query
        ? findSong(interaction.guildId, query)
        : getSongByIndex(interaction.guildId, parseInt(index) - 1);
    if (!song) {
        await interaction.reply("Song not found.");
        return;
    }
    if (bot.subscriptions.has(interaction.guild.id)) {
        bot.songs.set(interaction.guild.id, song);
        setCurrentSong(interaction.guild.id, song.index - 1)
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
        let player;
        if (!bot.players.has(interaction.guild.id)) {
            player = createAudioPlayer();
            bot.players.set(interaction.guild.id, player);
        }
        else {
            player = bot.players.get(interaction.guild.id);
        }
        const subscription = connection.subscribe(player);
        bot.subscriptions.set(interaction.guild.id, subscription);
        bot.songs.set(interaction.guild.id, song);
        if (!bot.interactions.has(interaction.guild.id))
            bot.interactions.set(interaction.guild.id, interaction);
        setCurrentSong(interaction.guild.id, song.index);
        play(interaction.guildId);
    }
};
export const command = {
    data,
    execute,
    voice: true,
};
