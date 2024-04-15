import { EmbedBuilder } from "discord.js";
import type { IPlaylist } from "../types/playlist.js";
import type { ISong } from "../types/song.js";

const itemsPerPage = 15;
export function playlistInfoEmbed(playlist: IPlaylist, songs: ISong[], page = 1) {
  return (
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
      .setColor(0x00008b)
  );
}

export function playlistsEmbed(playlists: IPlaylist[], page = 1) {
  return new EmbedBuilder()
    .addFields([
      {
        name: "Playlists",
        value: playlists
          .map(
            (playlist, i) => `${i + 1}. [${playlist.name}](${playlist.url}) by ${playlist.artist}`
          )
          .slice((page - 1) * itemsPerPage, page * itemsPerPage)
          .join("\n"),
      },
    ])
    .setColor(0x00008b);
}
