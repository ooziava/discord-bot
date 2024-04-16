import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { ActionsEnum } from "../types/models.js";
import type { ISong } from "../types/song.js";
import formatDate from "../utils/format-date.js";

function queueStringInput(array: ISong[], ended = false) {
  const options = array.map(parseQueueOption);
  const select = new StringSelectMenuBuilder()
    .setCustomId(ActionsEnum.QueueSelect)
    .setPlaceholder("Make a selection!")
    .addOptions(options)
    .setDisabled(ended)
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

export function parseQueueOption(video: ISong, index: number) {
  let description = `${video.artist} • ${formatDate(video.duration)} • ${video.source}`;
  let title = video.title;
  if (description.length > 100) description = description.substring(0, 97) + "...";
  if (title.length > 100) title = title.substring(0, 97) + "...";

  return new StringSelectMenuOptionBuilder()
    .setLabel(`${index + 1}. ${title}`)
    .setValue(video.url)
    .setDescription(description);
}

export default queueStringInput;