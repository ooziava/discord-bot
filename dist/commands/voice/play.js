import { SlashCommandBuilder, } from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";
import { play } from "../../services/play.js";
import { findSong, setCurrentSong } from "../../services/queue.js";
import { createConnection } from "../../utils/createConnection.js";
import bot from "../../index.js";
const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .addStringOption((option) => option
    .setName("find")
    .setDescription("Find song in queue")
    .setRequired(true));
const execute = async (interaction) => {
    const prompt = interaction.options.getString("find");
    const connection = createConnection(interaction);
    if (!connection)
        return;
    const song = findSong(interaction.guild.id, prompt);
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
        await play(interaction.guildId);
    }
};
export const command = {
    data,
    execute,
    voice: true,
};
