import { EmbedBuilder } from "discord.js";

import { ELEMENTS_PER_PAGE } from "../constants/index.js";

import type { IPlaylist, EmbedListBuilder, ISong } from "../types/index.js";

export const playlistInfoEmbed: EmbedListBuilder<ISong> = (
  songs: ISong[],
  page: number,
  playlist: IPlaylist
) =>
  new EmbedBuilder()
    .setTitle(playlist.name.slice(0, 256))
    .setURL(playlist.url)
    .setThumbnail(playlist.thumbnail ?? null)
    .setFooter({
      text: `Created by ${playlist.artist} | Source: ${playlist.source}`.slice(0, 2048),
    })
    .addFields([
      {
        name: "Songs",
        value: songs
          .map((song, i) => `${i + 1}. ${song.title}`.slice(0, 200))
          .slice((page - 1) * ELEMENTS_PER_PAGE, page * ELEMENTS_PER_PAGE)
          .join("\n"),
      },
    ])
    // dark blue
    .setColor(0x00008b);

export const playlistsEmbed: EmbedListBuilder<IPlaylist> = (playlists: IPlaylist[], page: number) =>
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
          .slice((page - 1) * ELEMENTS_PER_PAGE, page * ELEMENTS_PER_PAGE)
          .join("\n"),
      },
    ])
    // dark blue
    .setColor(0x00008b);
