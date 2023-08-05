import { CommandInteraction, GuildMember, VoiceBasedChannel } from "discord.js";

export default (interaction: CommandInteraction): VoiceBasedChannel | null => {
  const channel = (interaction.member as GuildMember)?.voice.channel;
  if (!channel) {
    interaction.reply({
      content: "You need to be in a voice channel to use this command",
      ephemeral: true,
    });
    return null;
  } else {
    return channel;
  }
};
