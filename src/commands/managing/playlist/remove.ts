import GuildService from "../../../services/guild.js";
import PlaylistService from "../../../services/playlist.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";

async function removePlaylist(interaction: MyCommandInteraction, query: string) {
  const playlist = await PlaylistService.getByNameOrUrl(query);
  if (!playlist) return await reply(interaction, "Playlist not found.", true);

  const response = await GuildService.removePlaylist(interaction.guildId, playlist._id);
  if (!response) return await reply(interaction, "Playlist not saved.", true);
  else return await reply(interaction, `Playlist removed: ${playlist.name}`);
}

export default removePlaylist;
