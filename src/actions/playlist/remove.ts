import type { StringSelectMenuInteraction } from "discord.js";
import { ActionsEnum } from "../../types/models.js";
import GuildService from "../../services/guild.js";
import PlaylistService from "../../services/playlist.js";

export const name = ActionsEnum.PlaylistSelect;
export const execute = async (interaction: StringSelectMenuInteraction<"cached" | "raw">) => {
  const url = interaction.values[0];
  const playlist = await PlaylistService.getByUrl(url);
  if (!playlist) return await interaction.deferUpdate();

  await GuildService.removePlaylist(interaction.guildId, playlist._id);
  await interaction.update({
    content: `Playlist removed: ${playlist.name}`,
    components: [],
  });
};
