import GuildService from "../../../services/guild.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import type { ISong } from "../../../types/song.js";
import reply from "../../../utils/reply.js";

async function infoPlaylist(interaction: MyCommandInteraction, query: string) {
  const playlist = await GuildService.searchPlaylist(interaction.guildId, query);
  if (!playlist) return await reply(interaction, "Playlist not found.", true);

  await playlist.populate("songs");
  const songs = playlist.songs as unknown as ISong[];

  return await reply(interaction, {
    embeds: [
      {
        url: `https://${playlist.url}`,
        title: playlist.name,
        thumbnail: playlist.thumbnail ? { url: playlist.thumbnail } : undefined,
        footer: { text: `Created by ${playlist.artist} | Source: ${playlist.source}` },
        fields: [
          {
            name: "Songs",
            value: songs
              .map((song, i) => `${i + 1}. ${song.title}`)
              .slice(0, 15)
              .join("\n"),
          },
        ],
        //dark blue
        color: 0x00008b,
        provider: { name: `Playlist Information`, url: `https://${playlist.url}` },
        // author: {
        //   name: `Playlist Information`,
        //   icon_url: interaction.client.user?.displayAvatarURL() as string,
        // },
      },
    ],
  });
}

export default infoPlaylist;
