import { GuildService, PlaylistService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import type { MyCommandInteraction } from "../../../types/command.js";

export default async function removePlaylist(interaction: MyCommandInteraction, query: string) {
  const playlist = await PlaylistService.getByNameOrUrl(query);
  if (!playlist) return await reply(interaction, "Playlist not found.");

  const response = await GuildService.removePlaylist(interaction.guildId, playlist._id);
  if (!response) return await reply(interaction, "Playlist not saved.");
  else return await reply(interaction, `Playlist removed: ${playlist.name}`);
}
