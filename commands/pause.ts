import { AudioPlayerStatus } from "@discordjs/voice";
import { type GuildMember, SlashCommandBuilder } from "discord.js";

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pause the current song");

export const execute: ExecuteCommand = async (interaction, client) => {
  const channel = (interaction.member as GuildMember)?.voice.channel;
  if (!channel) throw new Error("You must be in a voice channel to play a song!");

  const subscription = client.subscriptions.get(interaction.guildId!);
  if (!subscription) throw new Error("There is no song playing!");

  const player = subscription.player;
  if (player.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    await interaction.reply("Unpaused");
  } else {
    player.pause();
    await interaction.reply("Paused");
  }
};
