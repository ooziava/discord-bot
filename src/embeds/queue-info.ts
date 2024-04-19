import { EmbedBuilder } from "discord.js";

import { formatDuration } from "../utils/format-date.js";

import type { EmbedListBuilder, ISong } from "../types/index.js";

const itemsPerPage = 15;
const queueInfoEmbed: EmbedListBuilder<ISong> = (songs: ISong[], page: number) => {
  return (
    new EmbedBuilder()
      .addFields([
        {
          name: "Queue",
          value: songs
            .map((song, i) =>
              `${i + 1}. ${song.title} (${formatDuration(song.duration)})`.slice(0, 200)
            )
            .slice((page - 1) * itemsPerPage, page * itemsPerPage)
            .join("\n"),
        },
      ])
      // dark blue
      .setColor(0x00008b)
  );
};

export default queueInfoEmbed;
