import { EmbedBuilder, } from "discord.js";
import { getSong } from "../services/queue.js";
export const createPlayerEmbed = (interaction, song) => {
    const exampleEmbed = new EmbedBuilder();
    const guild = interaction.guild;
    if (!guild) {
        return exampleEmbed;
    }
    const songListLength = 6;
    const songList = [];
    for (let i = song.index - 2; i < song.index + songListLength - 2; i++) {
        const s = getSong(guild.id, i);
        if (s) {
            songList.push(s);
        }
    }
    if (songList.length === 0) {
        interaction.reply({
            content: "No songs found in the queue",
            ephemeral: true,
        });
        return exampleEmbed;
    }
    const songListStrings = songList.map((s) => s.index === song.index
        ? `***${s.index + 1}. ${s.title}***`
        : `${s.index + 1}. ${s.title}\n`);
    exampleEmbed
        .setTitle(song.title)
        .setURL(song.url)
        .setDescription(song.playlist ? `Playlist: ${song.playlist}` : "No playlist")
        .addFields({
        name: "List",
        value: songListStrings.join(""),
        inline: true,
    })
        .setTimestamp(new Date(song.timestamp))
        .setFooter({
        text: "Added by " + song.user?.name || interaction.user.username,
        iconURL: song.user?.avatar || interaction.user.avatarURL() || undefined,
    });
    if (song.thumbnail && song.thumbnail !== "") {
        exampleEmbed.setThumbnail(song.thumbnail);
    }
    if (song.author) {
        const authorIcon = song.author.avatar ? song.author.avatar : undefined;
        exampleEmbed.setAuthor({
            name: song.author.name,
            iconURL: authorIcon,
            url: song.author.url,
        });
    }
    return exampleEmbed;
};
