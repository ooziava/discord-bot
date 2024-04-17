import { EmbedBuilder } from "discord.js";
import type { YouTubeVideo } from "play-dl";
import formatDate from "../utils/format-date.js";

function searchInfoEmbed(songs: YouTubeVideo[]) {
  return (
    new EmbedBuilder()
      .addFields([
        {
          name: "Songs",
          value: songs
            .map((song, i) =>
              `${i + 1}. ${song.title} (${formatDate(song.durationInSec)})`.slice(0, 200)
            )
            .join("\n"),
        },
      ])
      // dark blue
      .setColor(0x00008b)
  );
}

export default searchInfoEmbed;
