import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Bot, Command } from "interfaces/discordjs";

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip the current song");

const execute = async (interaction: CommandInteraction, bot: Bot) => {
  const channel = (interaction.member as GuildMember).voice.channel;
  if (!channel) {
    await interaction.reply({
      content: "You need to be in a voice channel to use this command.",
      ephemeral: true,
    });
    return;
  }

  const { player } = bot.subscriptions.get(channel.guildId)!;

  if (player.state.status === "idle") {
    await interaction.reply({
      content: "There is no song playing.",
      ephemeral: true,
    });
  } else {
    player.stop();
    await interaction.reply("Skipped!");
  }
};

export const command: Command = {
  data,
  execute,
};
