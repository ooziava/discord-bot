import { validate } from "play-dl";

import { GuildService, SearchService, SongService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import { type MyCommandInteraction, SourceEnum } from "../../../types/index.js";

export default async function addToQueue(interaction: MyCommandInteraction, url: string) {
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
