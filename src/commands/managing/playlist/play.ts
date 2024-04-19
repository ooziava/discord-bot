import { GuildService, PlaylistService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import type { MyCommandInteraction } from "../../../types/command.js";

export default async function playPlaylist(interaction: MyCommandInteraction, query: string) {
  const playlist = await PlaylistService.getByNameOrUrl(query);
  if (!playlist) return await reply(interaction, "Playlist not found.");

  const songs = playlist.songs;
  if (!songs.length) return await reply(interaction, "Playlist is empty.");

  await GuildService.addToQueue(interaction.guildId, ...songs);
  return await reply(interaction, `${songs.length} songs added to the queue.`);
}
