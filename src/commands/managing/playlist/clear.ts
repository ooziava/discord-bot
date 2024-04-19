import GuildService from "../../../services/guild.js";
import { reply } from "../../../utils/reply.js";

import type { MyCommandInteraction } from "../../../types/command.js";

export default async function clearPlaylists(interaction: MyCommandInteraction) {
  await GuildService.clearPlaylists(interaction.guildId);
  return await reply(interaction, "Playlists cleared.");
}
