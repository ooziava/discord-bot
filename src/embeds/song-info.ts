import { EmbedBuilder } from "discord.js";
import type { NewSong } from "../types/song.js";

function songInfoEmbed({ title, duration, url, artist, thumbnail }: NewSong) {
  return new EmbedBuilder()
    .setTitle(
      `${title} (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`
    )
    .setURL(url)
    .setAuthor({
      name: artist,
    })
    .setThumbnail(thumbnail)
    .setColor(0x0099ff);
}

export default songInfoEmbed;
