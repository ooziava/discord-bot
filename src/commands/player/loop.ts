import { SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";
import GuildService from "../../services/guild.js";
import reply from "../../utils/reply.js";

export const data: Data = new SlashCommandBuilder()
  .setName("loop")
  .setDescription("Loop the current song");

export const execute: Execute = async (client, interaction) => {
  const guilg = await GuildService.toggleLoop(interaction.guildId);
  return await reply(interaction, guilg.loop ? "Looping enabled" : "Looping disabled");
};
