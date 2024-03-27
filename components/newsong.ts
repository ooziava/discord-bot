import { EmbedBuilder } from "discord.js";
import { formatDuration } from "../utils/parsing.js";

export default (song: StoredSong) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setDescription("Song added to queue!")
    .setURL(song.url)
    .setTitle(`${song.title} (${formatDuration(song.duration)})`);
