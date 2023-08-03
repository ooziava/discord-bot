import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "interfaces/discordjs";
import createConnection from "../../utils/createConnection.js";

const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Joins the voice channel you are in.");

const execute = async (interaction: CommandInteraction): Promise<void> => {
  createConnection(interaction);
};

export const command: Command = {
  data,
  execute,
};
