import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { ActionsEnum } from "../types/models.js";
import type { IPlaylist } from "../types/playlist.js";

function playlistStringInput(array: IPlaylist[]) {
  const options = array.map(parsePlaylist);
  const select = new StringSelectMenuBuilder()
    .setCustomId(ActionsEnum.PlaylistSelect)
    .setPlaceholder("Make a selection!")
    .addOptions(options)
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

function parsePlaylist(video: IPlaylist) {
  let description = `${video.artist} • ${video.songs.length} songs • ${video.source}`;
  let title = video.name || "No title found!";
  if (description.length > 100) description = description.substring(0, 97) + "...";
  if (title.length > 100) title = title.substring(0, 97) + "...";

  return new StringSelectMenuOptionBuilder()
    .setLabel(title)
    .setValue(video.url)
    .setDescription(description);
}

export default playlistStringInput;
