import { ButtonInteraction, Message } from "discord.js";

import { playlistInfoEmbed, playlistsEmbed } from "../../../embeds/playlists.js";
import navigation from "../../../components/buttons/navigation.js";

import GuildService from "../../../services/guild.js";
import { createNavigation, reply } from "../../../utils/index.js";

import type { MyCommandInteraction, ISong } from "../../../types/index.js";

const itemsPerPage = 15;
export default async function infoPlaylist(interaction: MyCommandInteraction, query?: string) {
  const filter = (i: ButtonInteraction) =>
    i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

  if (!query) {
    const playlists = await GuildService.getPlaylists(interaction.guildId);
    if (!playlists.length) return await reply(interaction, "No playlists saved.");
    else if (playlists.length > itemsPerPage) {
      const response = await reply(interaction, {
        embeds: [playlistsEmbed(playlists, 1)],
        components: [navigation()],
      });

      return createNavigation(response, playlists, { builder: playlistsEmbed }, filter);
    } else {
      return await reply(interaction, {
        embeds: [playlistsEmbed(playlists, 1)],
      });
    }
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

    return createNavigation(
      response,
      songs,
      { builder: playlistInfoEmbed, extra: [playlist] },
      filter
    );
  } else {
    return await reply(interaction, {
      embeds: [playlistInfoEmbed(songs, 1, playlist)],
    });
  }
}
