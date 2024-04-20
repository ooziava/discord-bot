import { ButtonInteraction, Message } from "discord.js";

import { playlistInfoEmbed, playlistsEmbed } from "../../../embeds/playlists.js";
import navigation from "../../../components/buttons/navigation.js";

import { ELEMENTS_PER_PAGE } from "../../../constants/index.js";
import GuildService from "../../../services/guild.js";
import { createNavigation, reply } from "../../../utils/index.js";

import type { MyCommandInteraction, ISong } from "../../../types/index.js";

const INIT_PAGE = 1;
export default async function infoPlaylist(interaction: MyCommandInteraction, query?: string) {
  const filter = (i: ButtonInteraction) =>
    i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

  if (!query) {
    const playlists = await GuildService.getPlaylists(interaction.guildId);
    if (!playlists.length) {
      await reply(interaction, "No playlists saved.");
      return;
    } else if (playlists.length > ELEMENTS_PER_PAGE) {
      const response = await reply(interaction, {
        embeds: [playlistsEmbed(playlists, INIT_PAGE)],
        components: [navigation()],
      });

      createNavigation(response, playlists, { builder: playlistsEmbed }, filter);
      return;
    } else {
      await reply(interaction, {
        embeds: [playlistsEmbed(playlists, INIT_PAGE)],
      });
      return;
    }
  }

  const playlist = await GuildService.getPlaylistByNameOrUrl(interaction.guildId, query);
  if (!playlist) return await reply(interaction, "Playlist not found.");

  await playlist.populate("songs");
  const songs = playlist.songs as unknown as ISong[];
  if (songs.length > ELEMENTS_PER_PAGE) {
    const response = await reply(interaction, {
      embeds: [playlistInfoEmbed(songs, INIT_PAGE, playlist)],
      components: [navigation()],
    });

    createNavigation(response, songs, { builder: playlistInfoEmbed, extra: [playlist] }, filter);
  } else {
    await reply(interaction, {
      embeds: [playlistInfoEmbed(songs, INIT_PAGE, playlist)],
    });
    return;
  }
}
