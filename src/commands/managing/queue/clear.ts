import GuildService from "../../../services/guild.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";

async function clearQueue(interaction: MyCommandInteraction) {
  await GuildService.clearQueue(interaction.guildId);
  return await reply(interaction, "Playlists cleared.");
}

export default clearQueue;
