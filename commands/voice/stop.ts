import { getVoiceConnection } from "@discordjs/voice";
import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Bot, Command } from "interfaces/discordjs.js";

const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Stop the current song");

const execute = async (
  interaction: CommandInteraction,
  bot: Bot | undefined
) => {
  const {
    voice: { channel },
  } = interaction.member as GuildMember;

  if (!channel) {
    await interaction.reply(`You are not in a voice channel.`);
    return;
  }

  const connection = getVoiceConnection(channel.guildId);

  if (!connection) {
    await interaction.reply(`I am not in a voice channel.`);
    return;
  }
  const subscription = bot?.subscriptions.get(channel.guildId);
  if (!!subscription) {
    subscription.player.stop();
    subscription.player.removeAllListeners();
    subscription.unsubscribe();
    bot?.subscriptions.set(channel.guildId, undefined!);
    interaction.reply("Stopped!");
    return;
  }
  await interaction.reply(`I am not playing anything.`);
};

export const command: Command = {
  data,
  execute,
};
