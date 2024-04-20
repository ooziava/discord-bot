import { SlashCommandBuilder } from "discord.js";

import GuildService from "../../services/guild.js";
import { reply } from "../../utils/reply.js";

import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("loop")
  .setDescription("Loop the current song");

export const execute: Execute = async (_client, interaction) => {
  const result = await GuildService.toggleLoop(interaction.guildId);
  await reply(
    interaction,
    result === undefined
      ? result
        ? "Looping enabled"
        : "Looping disabled"
      : "Something went wrong"
  );
};
