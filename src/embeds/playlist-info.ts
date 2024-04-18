import { EmbedBuilder } from "discord.js";
import type { IPlaylist } from "../types/playlist.js";
import type { ISong } from "../types/song.js";
import type { EmbedListBuilder } from "../types/embeds.js";

const itemsPerPage = 15;
export const playlistInfoEmbed: EmbedListBuilder<ISong> = (
  songs: ISong[],
  page: number,
  playlist: IPlaylist
) =>
  new EmbedBuilder()
    .setTitle(playlist.name)
    .setURL(playlist.url)
    .setThumbnail(playlist.thumbnail ?? null)
    .setFooter({ text: `Created by ${playlist.artist} | Source: ${playlist.source}` })
    .addFields([
      {
        name: "Songs",
        value: songs
          .map((song, i) => `${i + 1}. ${song.title}`.slice(0, 200))
          .slice((page - 1) * itemsPerPage, page * itemsPerPage)
          .join("\n"),
      },
    ])
    // dark blue
    .setColor(0x00008b);

export const playlistsEmbed: EmbedListBuilder<IPlaylist> = (
  playlists: IPlaylist[],
  page: number
) => {
  return (
    new EmbedBuilder()
      .addFields([
        {
          name: "Playlists",
          value: playlists
            .map((playlist, i) =>
              `${i + 1}. [${playlist.name}](${playlist.url}) • ${playlist.artist} • ${
                playlist.source
              }`.slice(0, 200)
            )
            .slice((page - 1) * itemsPerPage, page * itemsPerPage)
            .join("\n"),
        },
      ])
      // dark blue
      .setColor(0x00008b)
  );
};
