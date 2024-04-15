import { EmbedBuilder } from "discord.js";
import type { ISong } from "../types/song.js";
import formatDate from "../utils/format-date.js";

const songsPerPage = 15;
function queueInfoEmbed(songs: ISong[], page = 1) {
  const count = songs.length;

  return (
    new EmbedBuilder()
      .addFields([
        {
          name: "Queue",
          value:
            songs
              .map((song, i) => `${i + 1}. ${song.title}`.slice(0, 200))
              .slice((page - 1) * songsPerPage, page * songsPerPage)
              .join("\n") + (count > 15 ? `\n...and ${count - 15} more` : ""),
        },
      ])
      // dark blue
      .setColor(0x00008b)
  );
}

export default queueInfoEmbed;
