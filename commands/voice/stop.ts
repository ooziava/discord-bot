import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { type Bot, type Command } from "interfaces/discordjs";

const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Stop the current song");

const execute = async (interaction: CommandInteraction, bot: Bot) => {
  const channel = (interaction.member as GuildMember).voice.channel!;
  if (!channel) {
    await interaction.reply({
      content: "You need to be in a voice channel to use this command.",
      ephemeral: true,
    });
    return;
  }

  const subscription = bot?.subscriptions.get(channel.guildId);

  if (subscription) {
    subscription.player.stop();
    subscription.unsubscribe();
    bot.subscriptions.delete(channel.guildId);
    await interaction.reply("Stopped!");
  } else {
    await interaction.reply({
      content: "There is no song playing.",
      ephemeral: true,
    });
  }
};

export const command: Command = {
  data,
  execute,
};
