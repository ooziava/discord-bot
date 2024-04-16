import playlistStringInput from "../../../components/playlist-select.js";
import GuildService from "../../../services/guild.js";
import PlaylistService from "../../../services/playlist.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";
import { ActionsEnum } from "../../../types/models.js";
import { ComponentType, Message, type StringSelectMenuInteraction } from "discord.js";
import { playlistsEmbed } from "../../../embeds/playlist-info.js";

async function removePlaylist(interaction: MyCommandInteraction, query?: string) {
  if (!query) {
    const playlists = await GuildService.getPlaylists(interaction.guildId);
    if (!playlists.length) return await reply(interaction, "No playlists saved.");

    const list = playlists.slice(0, 15);
    const response = await reply(interaction, {
      embeds: [playlistsEmbed(list)],
      components: [playlistStringInput(list)],
    });

    const filter = (i: StringSelectMenuInteraction) =>
      i.customId === ActionsEnum.PlaylistSelect &&
      i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter,
      time: 30_000,
    });

    collector.on("end", async () => {
      await response.edit({ components: [playlistStringInput(list, true)] });
    });

    return collector.on("collect", async (i) => {
      const url = i.values[0];
      const playlist = playlists.find((p) => p.url === url);
      if (!playlist) return;

      await GuildService.removePlaylist(interaction.guildId, playlist._id);
      await i.update(`Playlist removed: ${playlist.name}`);
      collector.stop();
    });
  }

  const playlist = await PlaylistService.getByNameOrUrl(query);
  if (!playlist) return await reply(interaction, "Playlist not found.");

  const response = await GuildService.removePlaylist(interaction.guildId, playlist._id);
  if (!response) return await reply(interaction, "Playlist not saved.");
  else return await reply(interaction, `Playlist removed: ${playlist.name}`);
}

export default removePlaylist;
