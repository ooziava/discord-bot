import { playlistInfoEmbed, playlistsEmbed } from "../../../embeds/playlist-info.js";
import GuildService from "../../../services/guild.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import type { ISong } from "../../../types/song.js";
import reply from "../../../utils/reply.js";

async function infoPlaylist(interaction: MyCommandInteraction, query?: string) {
  if (!query) {
    const playlists = await GuildService.getPlaylists(interaction.guildId);
    if (!playlists.length) return await reply(interaction, "No playlists saved.");

    return await reply(interaction, {
      embeds: [playlistsEmbed(playlists)],
    });
  }

  const playlist = await GuildService.getPlaylistByNameOrUrl(interaction.guildId, query);
  if (!playlist) return await reply(interaction, "Playlist not found.");

  await playlist.populate("songs");
  const songs = playlist.songs as unknown as ISong[];

  return await reply(interaction, {
    embeds: [playlistInfoEmbed(playlist, songs)],
  });
}

export default infoPlaylist;
