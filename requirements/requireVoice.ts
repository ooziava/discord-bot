import { CommandInteraction, GuildMember } from "discord.js";

export default (interaction: CommandInteraction): boolean => {
  const {
    voice: { channel },
  } = interaction.member as GuildMember;
  return !!channel;
};
