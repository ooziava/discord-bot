import { EmbedBuilder } from "discord.js";

export default ({ title, url, author, thumbnail, timestamp, user }: Song) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(title)
    .setURL(url)
    .setAuthor({
      name: author.name,
      iconURL: author.thumbnail,
      url: author.url,
    })
    .setThumbnail(thumbnail)
    .setTimestamp(timestamp)
    .setFooter({ text: `Added by ${user.name}`, iconURL: user.thumbnail });
