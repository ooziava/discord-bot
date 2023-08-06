import {
  ButtonInteraction,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { type Song } from "interfaces/discordjs.js";
import { getSong } from "../services/queue.js";

const createPlayerEmbed = (
  interaction: CommandInteraction | ButtonInteraction,
  song: Song
) => {
  const songList = Array.from({ length: 6 }, (_, i) =>
    getSong(interaction.guild!.id, song.index! - 2 + i)
  ).filter(Boolean) as Song[];

  const songListStrings = songList.map((s) =>
    s.index === song.index!
      ? `***${s.index! + 1}. ${s.title}***`
      : `${s.index! + 1}. ${s.title}\n`
  );
  const exampleEmbed = new EmbedBuilder()
    .setColor(0x545fd6)
    .setTitle(song.title)
    .setURL(song.url)
    .setDescription(
      song.playlist ? `Playlist: ${song.playlist}` : "No playlist"
    )
    .addFields({
      name: "List",
      value: songListStrings.join(""),
      inline: true,
    })
    .setTimestamp(new Date(song.timestamp))
    .setFooter({
      text: "Added by " + song.user?.name || interaction.user.username,
      iconURL: song.user?.avatar || interaction.user.avatarURL() || undefined,
    });

  if (song.thumbnail && song.thumbnail !== "") {
    exampleEmbed.setThumbnail(song.thumbnail);
  }

  if (song.author) {
    const authorIcon = song.author.avatar ? song.author.avatar : undefined;
    exampleEmbed.setAuthor({
      name: song.author.name,
      iconURL: authorIcon,
      url: song.author.url,
    });
  }

  return exampleEmbed;
};

export { createPlayerEmbed };
