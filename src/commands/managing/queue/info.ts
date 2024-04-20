import { ButtonInteraction, Message } from "discord.js";

import navigation from "../../../components/buttons/navigation.js";
import queueInfoEmbed from "../../../embeds/queue-info.js";

import { ELEMENTS_PER_PAGE } from "../../../constants/index.js";
import GuildService from "../../../services/guild.js";
import { reply, createNavigation } from "../../../utils/index.js";

import type { MyCommandInteraction } from "../../../types/command.js";

const INIT_PAGE = 1;
export default async function infoQueue(interaction: MyCommandInteraction) {
  if (!(interaction instanceof Message)) await interaction.deferReply();

  const queue = await GuildService.getQueue(interaction.guildId);
  if (!queue.length) {
    await reply(interaction, "The queue is empty.");
  } else if (queue.length > ELEMENTS_PER_PAGE) {
    const response = await reply(interaction, {
      embeds: [queueInfoEmbed(queue, INIT_PAGE)],
      components: [navigation()],
    });

    const filter = (i: ButtonInteraction) =>
      i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

    createNavigation(response, queue, { builder: queueInfoEmbed }, filter);
  } else {
    await reply(interaction, {
      embeds: [queueInfoEmbed(queue, 1)],
    });
  }
}
