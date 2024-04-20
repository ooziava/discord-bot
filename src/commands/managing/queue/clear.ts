import GuildService from "../../../services/guild.js";
import { reply } from "../../../utils/reply.js";

import type { MyCommandInteraction } from "../../../types/command.js";

export default async function clearQueue(interaction: MyCommandInteraction) {
  await GuildService.clearQueue(interaction.guildId);
  await reply(interaction, "Queue cleared.");
}
