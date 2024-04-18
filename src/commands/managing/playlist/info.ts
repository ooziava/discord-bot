import { ButtonInteraction, ComponentType, Message } from "discord.js";
import navigation from "../../../components/navigation.js";
import { playlistInfoEmbed, playlistsEmbed } from "../../../embeds/playlist-info.js";
import GuildService from "../../../services/guild.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import type { ISong } from "../../../types/song.js";
import reply from "../../../utils/reply.js";
import { ButtonsEnum } from "../../../types/models.js";
import createNavigation from "../../../utils/create-navigation.js";

const itemsPerPage = 15;
async function infoPlaylist(interaction: MyCommandInteraction, query?: string) {
  if (!query) {
    const playlists = await GuildService.getPlaylists(interaction.guildId);
    if (!playlists.length) return await reply(interaction, "No playlists saved.");
    else if (playlists.length > itemsPerPage) {
      const response = await reply(interaction, {
        embeds: [playlistsEmbed(playlists, 1)],
        components: [navigation()],
      });

      const filter = (i: ButtonInteraction) =>
        i.user.id ===
        (interaction instanceof Message ? interaction.author.id : interaction.user.id);

      return createNavigation(response, playlists, { builder: playlistsEmbed }, filter);
    }

    return await reply(interaction, {
      embeds: [playlistsEmbed(playlists, 1)],
    });
  }

  const playlist = await GuildService.getPlaylistByNameOrUrl(interaction.guildId, query);
  if (!playlist) return await reply(interaction, "Playlist not found.");

  await playlist.populate("songs");
  const songs = playlist.songs as unknown as ISong[];
  if (songs.length > itemsPerPage) {
    const response = await reply(interaction, {
      embeds: [playlistInfoEmbed(songs, 1, playlist)],
      components: [navigation()],
    });

    const filter = (i: ButtonInteraction) =>
      i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

    return createNavigation(
      response,
      songs,
      { builder: playlistInfoEmbed, extra: [playlist] },
      filter
    );
  } else {
    await reply(interaction, {
      embeds: [playlistInfoEmbed(songs, 1, playlist)],
    });
  }
}

export default infoPlaylist;
