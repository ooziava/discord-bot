import { EmbedBuilder } from "discord.js";

export default (song: Song) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setDescription("Song added to queue!")
    .setURL(song.url)
    .setTitle(
      `${song.title} (${Math.floor(song.duration / 60)}:${(song.duration % 60)
        .toString()
        .padStart(2, "0")})`
    );
