import { getQueue } from "../services/queue.js";
const SONG_PER_PAGE = 15;
const setSongList = (interaction) => {
    const queue = getQueue(interaction.guild.id);
    let index = Math.ceil(queue.songs.length / SONG_PER_PAGE - 1) * SONG_PER_PAGE, message;
    return function (page) {
        if (page === "prev") {
            index -= SONG_PER_PAGE;
            if (index < 0)
                index = 0;
        }
        else if (page === "next") {
            if (index + SONG_PER_PAGE < queue.songs.length)
                index += SONG_PER_PAGE;
        }
        message = queue.songs
            .slice(index, index + SONG_PER_PAGE)
            .map((song, i) => `${index + i + 1}. ${song.title}`)
            .join("\n");
        return `\`\`\`${message}\`\`\` \n\n${index / SONG_PER_PAGE + 1} / ${Math.ceil(queue.songs.length / SONG_PER_PAGE)}`;
    };
};
export { setSongList };
