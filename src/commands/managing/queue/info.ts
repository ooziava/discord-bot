import { ButtonInteraction, ComponentType, Message } from "discord.js";
import navigation from "../../../components/navigation.js";
import queueInfoEmbed from "../../../embeds/queue-info.js";
import GuildService from "../../../services/guild.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";
import createNavigation from "../../../utils/create-navigation.js";

const itemsPerPage = 15;
async function infoQueue(interaction: MyCommandInteraction) {
  const queue = await GuildService.getQueue(interaction.guildId);
  if (!queue.length) return await reply(interaction, "The queue is empty.");
  if (queue.length > itemsPerPage) {
    const response = await reply(interaction, {
      embeds: [queueInfoEmbed(queue, 1)],
      components: [navigation()],
    });

    const filter = (i: ButtonInteraction) =>
      i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

    return createNavigation(response, queue, { builder: queueInfoEmbed }, filter);
  }

  return await reply(interaction, {
    embeds: [queueInfoEmbed(queue, 1)],
  });
}

export default infoQueue;
