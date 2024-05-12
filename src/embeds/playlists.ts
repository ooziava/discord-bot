import { EmbedBuilder, type APIEmbedField } from "discord.js";

import { ELEMENTS_PER_PAGE } from "../constants/index.js";

import type { IPlaylist, EmbedListBuilder, ISong } from "../types/index.js";
import { formatDuration } from "../utils/format-date.js";

export const playlistInfoEmbed: EmbedListBuilder<ISong> = (
  songs: ISong[],
  page: number,
  playlist: IPlaylist
) =>
  new EmbedBuilder()
    .setTitle(playlist.name.slice(0, 256))
    .setURL(playlist.url)
    .setDescription(`Total songs: ${playlist.songs.length}`.slice(0, 2048))
    .setThumbnail(playlist.thumbnail ?? null)
    .setFooter({
      text: `Created by ${playlist.artist} | Source: ${playlist.source}`.slice(0, 2048),
    })
    .addFields(
      songs
        .map(
          (song, i): APIEmbedField => ({
            name: `${i + 1}.  **${song.artist}** • ${formatDuration(song.duration)}`,
            value: `[${song.title}](${song.url})`,
          })
        )
        .slice((page - 1) * ELEMENTS_PER_PAGE, page * ELEMENTS_PER_PAGE)
    )
    // dark blue
    .setColor(0x00008b);

export const playlistsEmbed: EmbedListBuilder<IPlaylist> = (
  playlists: IPlaylist[],
  page: number
) => {
  const playlistObj: { [key: string]: string } = {};
  playlists
    .slice((page - 1) * ELEMENTS_PER_PAGE, page * ELEMENTS_PER_PAGE)
    .forEach((playlist, i) => {
      playlistObj[`${i + 1}.  **${playlist.artist}**`.slice(0, 256)] =
        `[${playlist.name}](${playlist.url})`.slice(0, 1024);
    });
  return (
    new EmbedBuilder()
      .addFields(
        Object.entries(playlistObj).map(([name, value]) => ({
          name,
          value,
        }))
      )
      // dark blue
      .setColor(0x00008b)
  );
};
