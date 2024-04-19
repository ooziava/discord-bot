import { EmbedBuilder } from "discord.js";

import type { IGuild } from "../types/guild.js";

export default function guildInfoEmbed(guild: IGuild, name: string) {
  return (
    new EmbedBuilder()
      .setTitle(`Your guild info - ${name}`)
      .setDescription(
        `Queue: ${guild.queue.length} songs\nSaved playlists: ${guild.playlists.length}`
      )
      .addFields([
        {
          name: "Prefix",
          value: guild.prefix,
          inline: true,
        },
        {
          name: "Volume",
          value: guild.volume.toString(),
          inline: true,
        },
        {
          name: "Loop",
          value: guild.loop ? "Enabled" : "Disabled",
          inline: true,
        },
        // {
        //   name: "Max Queue Size",
        //   value: guild.maxQueueSize.toString(),
        //   inline: true,
        // },
      ])
      // dark blue
      .setColor(0x00008b)
  );
}
