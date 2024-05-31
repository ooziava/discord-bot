import { GuildService, SearchService, SongService } from "../../../services/index.js";
import { reply } from "../../../utils/reply.js";

import { type MyCommandInteraction } from "../../../types/index.js";
import { Message } from "discord.js";

export default async function addToQueue(interaction: MyCommandInteraction, url: string) {
  if (!(interaction instanceof Message)) await interaction.deferReply();

  let song = await SongService.isExist(url);
  if (!song) {
    const video = await SearchService.getSongByURL(url);
    if (!video) {
      await reply(interaction, "No results found.");
      return;
    }

    const newSong = SongService.parseYoutubeVideo(video);
    song = (await SongService.isExist(newSong.url)) || (await SongService.save(newSong));
  }

  await GuildService.addToQueue(interaction.guildId, song._id);
  await reply(interaction, "Added to queue");
}
