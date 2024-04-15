import type { StringSelectMenuInteraction } from "discord.js";
import { ActionsEnum } from "../../types/models.js";
import SearchService from "../../services/search.js";
import SongService from "../../services/song.js";
import GuildService from "../../services/guild.js";

export const name = ActionsEnum.SearchSelect;
export const execute = async (interaction: StringSelectMenuInteraction<"cached" | "raw">) => {
  const url = interaction.values[0];
  const video = await SearchService.getSongByURL(url);
  if (!video) return;

  const newSong = SongService.parseYoutubeVideo(video);
  const stored = await SongService.getByUrl(newSong.url);
  const song = stored || (await SongService.save(newSong));
  await GuildService.addToQueue(interaction.guildId, song._id);
  return interaction.update({
    content: `Added [${song.title}](${song.url}) to the queue.`,
    components: [],
  });
};
