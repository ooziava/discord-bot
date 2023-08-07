import { SlashCommandBuilder } from "discord.js";

import { type Execute, type Command } from "interfaces/discordjs";
import { createConnection } from "../../utils/createConnection.js";

const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Joins the voice channel you are in.");

const execute: Execute = async (interaction) => {
  const connection = createConnection(interaction);
  if (connection) await interaction.reply("Joined voice channel!");
};

export const command: Command = {
  data,
  execute,
  voice: true,
};
