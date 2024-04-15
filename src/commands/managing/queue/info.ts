import queueInfoEmbed from "../../../embeds/queue-info.js";
import GuildService from "../../../services/guild.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";

async function infoQueue(interaction: MyCommandInteraction) {
  const queue = await GuildService.getQueue(interaction.guildId);
  if (!queue.length) return await reply(interaction, "The queue is empty.");

  return await reply(interaction, {
    embeds: [queueInfoEmbed(queue)],
  });
}

export default infoQueue;
