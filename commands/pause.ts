import { AudioPlayerStatus } from "@discordjs/voice";
import { SlashCommandBuilder } from "discord.js";
import notrack from "../components/notrack.js";

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pause the current song");

export const execute: ExecuteCommand = async (interaction, client) => {
  const guild = interaction.guild;
  if (!guild) throw new Error("There was an error while reading your guild ID!");

  const subscription = client.subscriptions.get(guild.id);
  if (!subscription) throw new Error("There is no song playing!");

  const player = subscription.player;
  if (player.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    await interaction.reply({ embeds: [notrack("Unpaused the current song!")] });
  } else {
    player.pause();
    await interaction.reply({ embeds: [notrack("Paused the current song!")] });
  }
};
