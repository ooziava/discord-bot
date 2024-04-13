import GuildService from "../../../services/guild.js";
import PlaylistService from "../../../services/playlist.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";

async function playPlaylist(interaction: MyCommandInteraction, query: string) {
  const playlist = await PlaylistService.getByNameOrUrl(query);
  if (!playlist) return await reply(interaction, "Playlist not found.", true);

  const songs = playlist.songs;
  if (!songs.length) return await reply(interaction, "Playlist is empty.", true);

  await GuildService.addToQueue(interaction.guildId, ...songs);
  return await reply(interaction, `${songs.length} songs added to the queue.`);
}

export default playPlaylist;
