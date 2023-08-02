import { CommandInteraction, GuildMember } from "discord.js";

export default (interaction: CommandInteraction): boolean => {
  const {
    voice: { channel },
  } = interaction.member as GuildMember;
  if (!channel) {
    interaction.reply(`You are not in a voice channel.`);
    return false;
  }
  return true;
};
