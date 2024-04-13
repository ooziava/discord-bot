import GuildService from "../../../services/guild.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";

async function clearPlaylists(interaction: MyCommandInteraction) {
  await GuildService.clearPlaylists(interaction.guildId);
  await reply(interaction, "Playlists cleared.");
}

export default clearPlaylists;
