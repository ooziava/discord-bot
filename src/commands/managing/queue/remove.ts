import GuildService from "../../../services/guild.js";
import SongService from "../../../services/song.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";

async function removeFromQueue(interaction: MyCommandInteraction, url: string) {
  let song = await SongService.getByUrl(url);
  if (!song) return await reply(interaction, "Song not found.", true);

  const response = await GuildService.removeFromQueue(interaction.guildId, song._id);
  if (!response) return await reply(interaction, "Song not in queue.", true);
  else return await reply(interaction, `Removed from queue: ${song.title}`);
}

export default removeFromQueue;
