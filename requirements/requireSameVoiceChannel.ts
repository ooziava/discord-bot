import { getVoiceConnection } from "@discordjs/voice";
import { CommandInteraction, GuildMember } from "discord.js";

export default (interaction: CommandInteraction): boolean => {
  const {
    voice: { channel },
  } = interaction.member as GuildMember;
  if (!channel) {
    return false;
  }

  const connection = getVoiceConnection(channel.guildId);
  if (!connection) {
    return false;
  }

  return true;
};
