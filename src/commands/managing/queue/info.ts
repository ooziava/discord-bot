import GuildService from "../../../services/guild.js";
import type { MyCommandInteraction } from "../../../types/command.js";
import type { ISong } from "../../../types/song.js";
import reply from "../../../utils/reply.js";

async function infoQueue(interaction: MyCommandInteraction) {
  const queue = await GuildService.getQueue(interaction.guildId);
  if (!queue.length) return await reply(interaction, "The queue is empty.");

  const duration = queue.reduce((acc, song) => acc + song.duration, 0);
  const count = queue.length;

  return await reply(interaction, {
    embeds: [
      {
        title: "Queue Information",
        description: `Duration: ${new Date(duration * 1000).toISOString().slice(11, 19)}`,
        fields: [
          {
            name: "",
            value:
              queue
                .map((song, i) => `${i + 1}. ${song.title}`)
                .slice(0, 15)
                .join("\n") + (count > 15 ? `\n...and ${count - 15} more` : ""),
          },
        ],
        //dark blue
        color: 0x00008b,
        // author: {
        //   name: `Playlist Information`,
        //   icon_url: interaction.client.user?.displayAvatarURL() as string,
        // },
      },
    ],
  });
}

export default infoQueue;
