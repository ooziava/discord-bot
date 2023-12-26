import { SlashCommandBuilder } from "discord.js";
import notrack from "../components/notrack.js";

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Stop the current song");

export const execute: ExecuteCommand = async (interaction, client) => {
  const guild = interaction.guild;
  if (!guild) throw new Error("There was an error while reading your guild ID!");

  client.timers.delete(guild.id);
  client.currentSongs.delete(guild.id);
  const subscription = client.subscriptions.get(guild.id);
  if (subscription) {
    const player = subscription.player;
    const connection = subscription.connection;
    player.removeAllListeners();
    connection.removeAllListeners();

    subscription.unsubscribe();
    connection.disconnect();
    player.stop();

    client.subscriptions.delete(guild.id);
  }
  await interaction.reply({ embeds: [notrack("Stopped the current song!")] });
};
