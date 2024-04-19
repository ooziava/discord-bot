import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import { type IPlaylist, ActionsEnum } from "../../types/index.js";

const select = new StringSelectMenuBuilder()
  .setCustomId(ActionsEnum.PlaylistSelect)
  .setPlaceholder("Make a selection!")
  .setMinValues(1)
  .setMaxValues(1);

export default function playlistStringInput(array: IPlaylist[], ended = false) {
  const options = array.map(parsePlaylistOption);
  select.setOptions(options).setDisabled(ended);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

export function parsePlaylistOption(video: IPlaylist, index: number) {
  let description = `${video.artist} • ${video.songs.length} songs • ${video.source}`;
  let title = video.name || "No title found!";
  if (description.length > 100) description = description.substring(0, 97) + "...";
  if (title.length > 100) title = title.substring(0, 97) + "...";

  return new StringSelectMenuOptionBuilder()
    .setLabel(`${index + 1}. ${title}`)
    .setValue(video.url)
    .setDescription(description);
}
