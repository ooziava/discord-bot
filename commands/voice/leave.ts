import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "interfaces/discordjs";
import createConnection from "../../utils/createConnection.js";

const data = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("Leaves the voice channel you are in.");

const execute = async (interaction: CommandInteraction) => {
  const connection = createConnection(interaction);
  if (!connection) return;

  connection.disconnect();
  await interaction.reply(`Left`);
};

export const command: Command = {
  data,
  execute,
};
