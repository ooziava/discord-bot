import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import type { YouTubeVideo } from "play-dl";
import formatDate from "../utils/format-date.js";
import { ActionsEnum } from "../types/models.js";

function searchInput(array: YouTubeVideo[]) {
  const options = array.map(parseSearchOption);
  const select = new StringSelectMenuBuilder()
    .setCustomId(ActionsEnum.SearchSelect)
    .setPlaceholder("Make a selection!")
    .addOptions(options)
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

function parseSearchOption(video: YouTubeVideo) {
  let description = `${video.channel?.name} • ${video.views.toLocaleString("en-EN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    compactDisplay: "short",
    notation: "compact",
  })} views • ${formatDate(video.durationInSec)}`;
  let title = video.title || "No title found!";
  if (description.length > 100) description = description.substring(0, 97) + "...";
  if (title.length > 100) title = title.substring(0, 97) + "...";

  return new StringSelectMenuOptionBuilder()
    .setLabel(title)
    .setValue(video.url)
    .setDescription(description);
}

export default searchInput;
