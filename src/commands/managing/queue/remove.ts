import { GuildService, SongService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import type { MyCommandInteraction } from "../../../types/command.js";

export default async function removeFromQueue(interaction: MyCommandInteraction, url: string) {
  let song = await SongService.getByUrl(url);
  if (!song) return await reply(interaction, "Song not found.");

  const response = await GuildService.removeFromQueue(interaction.guildId, song._id);
  if (!response) return await reply(interaction, "Song not in queue.");
  else return await reply(interaction, `Removed from queue: ${song.title}`);
}
