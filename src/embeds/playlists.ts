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
    // .sort((a, b) => {
    //   if (a.name < b.name) return -1; // a comes before b
    //   if (a.name > b.name) return 1; // a comes after b
    //   return 0;
    // })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice((page - 1) * ELEMENTS_PER_PAGE, page * ELEMENTS_PER_PAGE)
    .forEach((playlist) => {
      const name = playlist.artist;
      const value = `[${playlist.name}](${playlist.url})`.slice(0, 1024);
      if (playlistObj[name]) playlistObj[name] += `\n${value}`;
      else playlistObj[name] = value;
    });
  return (
    new EmbedBuilder()
      .addFields(
        Object.entries(playlistObj).map(([name, value], i) => ({
          name: `${i + 1}.  **${name}**`.slice(0, 256),
          value,
        }))
      )
      // dark blue
      .setColor(0x00008b)
  );
};
