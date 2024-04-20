import { GuildService, SongService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import type { MyCommandInteraction } from "../../../types/command.js";

export default async function removeFromQueue(interaction: MyCommandInteraction, url: string) {
  let song = await SongService.isExist(url);
  if (!song) {
    await reply(interaction, "Song not found.");
    return;
  }

  const response = await GuildService.removeFromQueue(interaction.guildId, song._id);
  if (!response.modifiedCount) {
    await reply(interaction, "Song not found.");
    return;
  }

  await reply(interaction, "Removed from queue");
}
