import { getVoiceConnection } from "@discordjs/voice";
import { CommandInteraction, GuildMember } from "discord.js";

export default (interaction: CommandInteraction): boolean => {
  const {
    voice: { channel },
  } = interaction.member as GuildMember;
  if (!channel) {
    interaction.reply(`You are not in a voice channel.`);
    return false;
  }

  const connection = getVoiceConnection(channel.guildId);
  if (!connection) {
    interaction.reply(`I am not in a voice channel.`);
    return false;
  }

  return true;
};
