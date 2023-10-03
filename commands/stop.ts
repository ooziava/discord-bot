import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder().setName("stop").setDescription("Stops the player");

export const execute: Execute = async (interaction, client) => {
  const sub = client.subscriptions.get(interaction.guildId!);
  if (sub) {
    sub.unsubscribe();
    sub.player.stop();
    sub.connection.disconnect();
    client.subscriptions.delete(interaction.guildId!);
    await interaction.reply({
      content: "Stopped the player!",
    });
  } else {
    await interaction.reply({
      content: "I'm not in a voice channel!",
      ephemeral: true,
    });
  }
};
