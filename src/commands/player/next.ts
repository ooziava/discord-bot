import { SlashCommandBuilder, Message } from "discord.js";

import GuildService from "../../services/guild.js";
import { reply } from "../../utils/reply.js";

import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip songs in the queue")
  .addIntegerOption((option) =>
    option.setName("amount").setDescription("The amount of songs to skip")
  );

export const execute: Execute = async (client, interaction, args) => {
  const amount =
    interaction instanceof Message
      ? parseInt(args?.[0] ?? "1")
      : interaction.options.getInteger("amount") ?? 1;

  if (amount < 1) {
    await reply(interaction, "The amount must be at least 1", true);
    return;
  }

  const player = client.players.get(interaction.guildId);
  if (player) {
    await GuildService.playNext(interaction.guildId, amount - 1);
    player.stop();
  } else {
    await GuildService.playNext(interaction.guildId, amount);
  }

  await reply(interaction, `Skipped ${amount > 1 ? `${amount} songs` : ""}`);
};
