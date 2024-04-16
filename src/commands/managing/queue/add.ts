import { validate } from "play-dl";
import GuildService from "../../../services/guild.js";
import SearchService from "../../../services/search.js";
import SongService from "../../../services/song.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import reply from "../../../utils/reply.js";
import { SourceEnum } from "../../../types/source.js";

async function addToQueue(interaction: MyCommandInteraction, url: string) {
  let song = await SongService.getByUrl(url);
  if (!song) {
    const result = await validate(url).catch(() => null);
    const source = result && result.includes("sp_") ? SourceEnum.Spotify : SourceEnum.Youtube;
    const video = await SearchService.getSongByURL(url, { source });
    if (!video) return await reply(interaction, "No results found.");

    const newSong = SongService.parseYoutubeVideo(video);
    song = await SongService.save(newSong);
  }

  await GuildService.addToQueue(interaction.guildId, song._id);
  return await reply(interaction, `Added to queue: ${song.title}`);
}

export default addToQueue;
