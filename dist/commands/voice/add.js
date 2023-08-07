import { SlashCommandBuilder, } from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";
import { addSongsToQueue } from "../../services/queue.js";
import { play } from "../../services/play.js";
import { search } from "../../services/search.js";
import { createConnection } from "../../utils/createConnection.js";
import bot from "../../index.js";
const data = new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a song")
    .addStringOption((option) => option
    .setName("search")
    .setDescription("Search song to play")
    .setRequired(true));
const execute = async (interaction) => {
    const prompt = interaction.options.getString("search");
    const connection = createConnection(interaction);
    if (!connection)
        return;
    await interaction.deferReply();
    let songs = [];
    try {
        songs = await search(prompt);
    }
    catch (error) {
        interaction.editReply("Something went wrong.");
        return;
    }
    if (!songs.length) {
        await interaction.editReply("No song found.");
        return;
    }
    else {
        songs.forEach((song, index) => {
            song.user = {
                name: interaction.user.username,
                url: interaction.user.displayAvatarURL(),
                avatar: interaction.user.displayAvatarURL(),
            };
            song.index = index;
        });
        await interaction.editReply(songs.length > 1
            ? `Added to queue: ${songs.length} songs from ${songs[0].playlist}`
            : `Added to queue: ${songs[0].title}`);
    }
    let isNewQueue = false;
    if (bot.subscriptions.has(interaction.guild.id)) {
        addSongsToQueue(interaction.guild.id, songs, { isNewQueue });
    }
    else {
        let player;
        isNewQueue = true;
        if (!bot.players.has(interaction.guild.id)) {
            player = createAudioPlayer();
            bot.players.set(interaction.guild.id, player);
        }
        else {
            player = bot.players.get(interaction.guild.id);
        }
        const subscription = connection.subscribe(player);
        const song = addSongsToQueue(interaction.guild.id, songs, { isNewQueue });
        bot.subscriptions.set(interaction.guild.id, subscription);
        bot.songs.set(interaction.guild.id, song);
        if (!bot.interactions.has(interaction.guild.id))
            bot.interactions.set(interaction.guild.id, interaction);
        await play(interaction.guildId);
    }
};
export const command = {
    data,
    execute,
    voice: true,
};
