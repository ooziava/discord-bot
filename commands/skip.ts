import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skips the current song");

export const execute: Execute = async (interaction, client) => {
  const player = client.subscriptions.get(interaction.guildId!)?.player;
  if (!player) {
    await interaction.reply({
      content: "Not playing in this server!",
      ephemeral: true,
    });
    return;
  }
  player.stop();
  await interaction.reply({
    content: "Skipped current song!",
    ephemeral: true,
  });
};
