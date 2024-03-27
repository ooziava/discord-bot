import { EmbedBuilder } from "discord.js";
import { formatDuration } from "../utils/parsing.js";

export default (
  { title, duration, url, author, thumbnail, timestamp, user }: StoredSong,
  next?: StoredSong | null
) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${title} (${formatDuration(duration)})`)
    .setURL(url)
    .setAuthor({
      name: author.name,
      iconURL: author.thumbnail,
      url: author.url,
    })
    .setThumbnail(thumbnail)
    .setTimestamp(timestamp)
    .setFooter({ text: `Added by ${user.name}`, iconURL: user.thumbnail })
    .setDescription(next ? `Next: ${next.title}` : next === null ? "Last song" : null);
