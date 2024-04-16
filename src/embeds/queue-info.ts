import { EmbedBuilder } from "discord.js";
import type { ISong } from "../types/song.js";

function queueInfoEmbed(songs: ISong[]) {
  return (
    new EmbedBuilder()
      .addFields([
        {
          name: "Queue",
          value: songs.map((song, i) => `${i + 1}. ${song.title}`.slice(0, 200)).join("\n"),
        },
      ])
      // dark blue
      .setColor(0x00008b)
  );
}

export default queueInfoEmbed;
