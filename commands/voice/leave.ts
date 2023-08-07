import { SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import { type Execute, type Command } from "interfaces/discordjs";
import bot from "../../index.js";

const data = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("Leaves the voice channel you are in.");

const execute: Execute = async (interaction) => {
  const connection = getVoiceConnection(interaction.guildId!);
  if (connection) {
    connection.disconnect();
    if (bot.subscriptions.has(interaction.guildId!)) {
      bot.subscriptions.get(interaction.guildId!)?.unsubscribe();
      bot.subscriptions.delete(interaction.guildId!);
    }
    bot.activeMessages.delete(interaction.guildId!);
    bot.interactions.delete(interaction.guildId!);
    bot.players.delete(interaction.guildId!);
    bot.songs.delete(interaction.guildId!);
    bot.songAttributes.delete(interaction.guildId!);
    await interaction.reply("Left voice channel!");
  }
};

export const command: Command = {
  data,
  execute,
  voice: true,
};
