import { SlashCommandBuilder } from "discord.js";
import notrack from "../components/notrack.js";

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Stop the current song");

export const execute: ExecuteCommand = async (interaction, client) => {
  const guild = interaction.guild;
  if (!guild) throw new Error("There was an error while reading your guild ID!");

  const subscription = client.subscriptions.get(guild.id);
  if (!subscription) throw new Error("There is no song playing!");

  const player = subscription.player;
  player.removeAllListeners();
  player.stop();
  subscription.unsubscribe();
  subscription.connection.disconnect();
  client.subscriptions.delete(guild.id);
  await interaction.reply({ embeds: [notrack("Stopped the current song!")] });
};
