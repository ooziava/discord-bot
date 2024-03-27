import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { formatDuration } from "../utils/parsing.js";

export default (array: Video[]) => {
  const options = array.map((video, index) => {
    let description = `${video.channel?.name} • ${video.views.toLocaleString("en-EN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      compactDisplay: "short",
      notation: "compact",
    })} views • ${formatDuration(video.durationInSec)}`;
    if (description.length > 100) {
      description = description.substring(0, 97) + "...";
    }
    return new StringSelectMenuOptionBuilder()
      .setLabel(video.title ?? "No title found!")
      .setValue(`song-${index}`)
      .setDescription(description);
  });
  const select = new StringSelectMenuBuilder()
    .setCustomId("track-select")
    .setPlaceholder("Make a selection!")
    .addOptions(options)
    .setMinValues(1)
    .setMaxValues(Math.min(10, array.length));

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
};
