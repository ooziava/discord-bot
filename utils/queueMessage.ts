import { CommandInteraction } from "discord.js";
import { getQueue } from "../services/queue.js";

type ListUpdater = (page?: string) => string;

const SONG_PER_PAGE = 15;
const setSongList = (interaction: CommandInteraction): ListUpdater => {
  const queue = getQueue(interaction.guild!.id);
  let index = Math.floor(queue.songs.length / SONG_PER_PAGE) * SONG_PER_PAGE,
    message;
  return function (page?: string): string {
    if (page === "prev") {
      index -= SONG_PER_PAGE;
      if (index < 0) index = 0;
    } else if (page === "next") {
      if (index + SONG_PER_PAGE < queue.songs.length) index += SONG_PER_PAGE;
    }

    message = queue.songs
      .slice(index, index + SONG_PER_PAGE)
      .map((song, i) => `${index + i + 1}. ${song.title}`)
      .join("\n");
    return `\`\`\`${message}\`\`\` \n\n${
      index / SONG_PER_PAGE + 1
    } / ${Math.ceil(queue.songs.length / SONG_PER_PAGE)}`;
  };
};

export { setSongList };
