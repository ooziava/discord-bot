import { SlashCommandBuilder, Message } from "discord.js";
import type { Data, Execute } from "../../types/command.js";
import GuildService from "../../services/guild.js";
import reply from "../../utils/reply.js";

export const data: Data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Show the list")
  .addSubcommand((subcommand) =>
    subcommand.setName("queue").setDescription("Show songs in the queue")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("plylists").setDescription("Show the playlists")
  );

export const execute: Execute = async (interaction, args) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();

  switch (subcommand) {
    case "queue":
    case "q":
      const queue = await GuildService.getQueue(interaction.guildId);
      return await reply(
        interaction,
        queue
          .slice(0, 15)
          .reduce((acc, song, index) => `${acc}${index + 1}. ${song.title}\n`, "Queue:\n")
      );
    case "plylists":
    case "pls":
      const playlists = await GuildService.getPlaylists(interaction.guildId);
      return await reply(
        interaction,
        playlists
          .slice(0, 15)
          .reduce(
            (acc, playlist, index) => `${acc}${index + 1}. ${playlist.name}\n`,
            "Playlists:\n"
          )
      );
    default:
      await reply(interaction, "Please provide a valid subcommand.", true);
  }
};
