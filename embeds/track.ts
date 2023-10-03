import { EmbedBuilder } from "discord.js";

export default (
  { title, duration, url, author, thumbnail, timestamp, user }: Song,
  next?: Song | null
) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(
      `${title} (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`
    )
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
