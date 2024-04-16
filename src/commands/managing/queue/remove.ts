import { ComponentType, Message, type StringSelectMenuInteraction } from "discord.js";
import GuildService from "../../../services/guild.js";
import SongService from "../../../services/song.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";
import { ActionsEnum } from "../../../types/models.js";
import queueStringInput from "../../../components/queue-select.js";
import queueInfoEmbed from "../../../embeds/queue-info.js";

async function removeFromQueue(interaction: MyCommandInteraction, url?: string) {
  if (!url) {
    const queue = await GuildService.getQueue(interaction.guildId);
    if (!queue.length) return await reply(interaction, "Queue is empty.");

    const list = queue.slice(0, 15);
    const response = await reply(interaction, {
      embeds: [queueInfoEmbed(list)],
      components: [queueStringInput(list)],
    });

    const filter = (i: StringSelectMenuInteraction) =>
      i.customId === ActionsEnum.QueueSelect &&
      i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter,
      time: 30_000,
    });

    collector.on("end", async () => {
      await response.edit({ components: [queueStringInput(list, true)] });
    });

    return collector.on("collect", async (i) => {
      const url = i.values[0];
      const song = queue.find((p) => p.url === url);
      if (!song) return;

      await GuildService.removeFromQueue(interaction.guildId, song._id);
      await i.reply(`Song removed from queue: ${song.title}`);
      collector.stop();
    });
  }

  let song = await SongService.getByUrl(url);
  if (!song) return await reply(interaction, "Song not found.");

  const response = await GuildService.removeFromQueue(interaction.guildId, song._id);
  if (!response) return await reply(interaction, "Song not in queue.");
  else return await reply(interaction, `Removed from queue: ${song.title}`);
}

export default removeFromQueue;
