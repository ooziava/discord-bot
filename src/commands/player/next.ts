import { SlashCommandBuilder, Message } from "discord.js";
import type { Data, Execute } from "../../types/command.js";
import GuildService from "../../services/guild.js";
import reply from "../../utils/reply.js";

export const data: Data = new SlashCommandBuilder()
  .setName("next")
  .setDescription("Play the next song")
  .addIntegerOption((option) =>
    option.setName("amount").setDescription("The amount of songs to skip")
  );

export const execute: Execute = async (client, interaction, args) => {
  const amount =
    interaction instanceof Message
      ? parseInt(args?.[0] ?? "1")
      : interaction.options.getInteger("amount") ?? 1;
  if (amount < 1) return await reply(interaction, "The amount must be at least 1", true);

  const guild = await GuildService.playNext(interaction.guildId, amount);
  if (!guild) return await reply(interaction, "The queue is empty", true);

  const player = client.players.get(interaction.guildId);
  if (player) player.stop();
  else return await reply(interaction, "Cannot find the player", true);
  return await reply(interaction, `Skipped ${amount > 1 ? `${amount} songs` : ""}`);
};
