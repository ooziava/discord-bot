import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import type { YouTubeVideo } from "play-dl";

import { formatDuration } from "../../utils/format-date.js";

import { ActionsEnum } from "../../types/models.js";

export default function searchInput(array: YouTubeVideo[], ended = false) {
  const options = array.map(parseSearchOption);
  const select = new StringSelectMenuBuilder()
    .setCustomId(ActionsEnum.SearchSelect)
    .setPlaceholder("Make a selection!")
    .addOptions(options)
    .setDisabled(ended)
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

export function parseSearchOption(video: YouTubeVideo, index: number) {
  let description = `${video.channel?.name} • ${video.views.toLocaleString("en-EN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    compactDisplay: "short",
    notation: "compact",
  })} views • ${formatDuration(video.durationInSec)}`;
  let title = video.title || "No title found!";
  if (description.length > 100) description = description.substring(0, 97) + "...";
  if (title.length > 100) title = title.substring(0, 97) + "...";

  return new StringSelectMenuOptionBuilder()
    .setLabel(`${index + 1}. ${title}`)
    .setValue(video.url)
    .setDescription(description);
}
