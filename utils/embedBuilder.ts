import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Song } from "interfaces/discordjs.js";
import { getSong } from "../services/queue.js";

const createPlayerEmbed = (
  interaction: CommandInteraction,
  song: Song,
  index: number
) => {
  const songList = Array.from({ length: 6 }, (_, i) =>
    getSong(interaction.guild!.id, index - 2 + i)
  ).filter(Boolean) as Song[];
  const songListStrings = songList.map((song, i) =>
    i === 2
      ? `***${song.index! + 1}. ${song.title}***`
      : `${song.index! + 1}. ${song.title}\n`
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
    .setTimestamp()
    .setFooter({
      text: "Created by: " + interaction.user.username,
      iconURL: interaction.user.avatarURL() ?? undefined,
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
