import { getVoiceConnection } from "@discordjs/voice";
import { type GuildMember, SlashCommandBuilder } from "discord.js";

export const cooldown = 5;
export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Stop the current song");

export const execute: ExecuteCommand = async (interaction, client) => {
  const channel = (interaction.member as GuildMember)?.voice.channel;
  if (!channel) throw new Error("You must be in a voice channel to play a song!");

  const guildId = interaction.guildId;
  if (!guildId) throw new Error("There was an error while reading your guild ID!");

  // client.interactions.delete(guildId);
  const subscription = client.subscriptions.get(guildId);
  if (subscription) {
    subscription.connection.disconnect();
  } else {
    const connection = getVoiceConnection(guildId);
    if (connection) connection.disconnect();
    else throw new Error("Bot is not connected to any voice channel");
  }
  await interaction.reply("Stopped");
};
