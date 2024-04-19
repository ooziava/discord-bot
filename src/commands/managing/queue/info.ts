import { ButtonInteraction, Message } from "discord.js";

import navigation from "../../../components/buttons/navigation.js";
import queueInfoEmbed from "../../../embeds/queue-info.js";

import GuildService from "../../../services/guild.js";
import { reply, createNavigation } from "../../../utils/index.js";

import type { MyCommandInteraction } from "../../../types/command.js";

const itemsPerPage = 15;
export default async function infoQueue(interaction: MyCommandInteraction) {
  const queue = await GuildService.getQueue(interaction.guildId);
  if (!queue.length) return await reply(interaction, "The queue is empty.");
  else if (queue.length > itemsPerPage) {
    const response = await reply(interaction, {
      embeds: [queueInfoEmbed(queue, 1)],
      components: [navigation()],
    });

    const filter = (i: ButtonInteraction) =>
      i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

    return createNavigation(response, queue, { builder: queueInfoEmbed }, filter);
  } else {
    return await reply(interaction, {
      embeds: [queueInfoEmbed(queue, 1)],
    });
  }
}
