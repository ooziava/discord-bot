import { EmbedBuilder, type APIEmbed, type APIEmbedField } from "discord.js";

import { formatDuration } from "../utils/format-date.js";

import type { EmbedListBuilder, ISong } from "../types/index.js";
import { ELEMENTS_PER_PAGE } from "../constants/index.js";

const queueInfoEmbed: EmbedListBuilder<ISong> = (songs: ISong[], page: number) => {
  return (
    new EmbedBuilder()
      .setTitle("Queue")
      .addFields(
        songs
          .map(
            (song, i): APIEmbedField => ({
              name: `${i + 1}.  **${song.artist}** • ${formatDuration(song.duration)}`,
              value: `[${song.title}](${song.url})`,
            })
          )
          .slice((page - 1) * ELEMENTS_PER_PAGE, page * ELEMENTS_PER_PAGE)
      )
      // dark blue
      .setColor(0x00008b)
  );
};

export default queueInfoEmbed;
