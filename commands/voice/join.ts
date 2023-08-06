import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import { type Command } from "interfaces/discordjs";
import createConnection from "../../utils/createConnection.js";

const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Joins the voice channel you are in.");

const execute = async (interaction: CommandInteraction): Promise<void> => {
  const connection = createConnection(interaction);
  if (connection) await interaction.reply("Joined voice channel!");
};

export const command: Command = {
  data,
  execute,
};
