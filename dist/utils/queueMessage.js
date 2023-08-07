import { getQueue } from "../services/queue.js";
const SONGS_PER_PAGE = 15;
const createSongListUpdater = (interaction) => {
    const queue = getQueue(interaction.guild.id);
    let index = Math.ceil(queue.songs.length / SONGS_PER_PAGE - 1) * SONGS_PER_PAGE;
    return function (page) {
        switch (page) {
            case "prev":
                index -= SONGS_PER_PAGE;
                if (index < 0)
                    index = 0;
                break;
            case "next":
                if (index + SONGS_PER_PAGE < queue.songs.length)
                    index += SONGS_PER_PAGE;
                break;
            default:
                break;
        }
        let message = "";
        for (let i = index; i < index + SONGS_PER_PAGE && i < queue.songs.length; i++) {
            message += `${i + 1}. ${queue.songs[i].title}\n`;
        }
        const currentPage = Math.floor(index / SONGS_PER_PAGE) + 1;
        const totalPages = Math.ceil(queue.songs.length / SONGS_PER_PAGE);
        return `\`\`\`${message}\`\`\`\n\n${currentPage} / ${totalPages}`;
    };
};
export { createSongListUpdater };
