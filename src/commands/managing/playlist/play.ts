import { GuildService, PlaylistService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import type { MyCommandInteraction } from "../../../types/command.js";

export default async function playPlaylist(interaction: MyCommandInteraction, query: string) {
  const playlist = await PlaylistService.getByNameOrUrl(query);
  if (!playlist) {
    await reply(interaction, "Playlist not found.");
    return;
  }

  const songs = playlist.songs;
  if (!songs.length) {
    await reply(interaction, "Playlist is empty.");
    return;
  }

  await GuildService.addToQueue(interaction.guildId, ...songs);
  await reply(interaction, `${songs.length} songs added to the queue.`);
}
