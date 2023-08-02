import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Bot } from "interfaces/discordjs.js";

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip the current song");

const execute = async (interaction: CommandInteraction, bot: Bot) => {
  const channel = (interaction.member as GuildMember).voice.channel;

  if (!channel) {
    await interaction.reply(`You are not in a voice channel.`);
    return;
  }

  const connection = bot?.subscriptions.get(channel.guildId);

  if (!connection) {
    await interaction.reply(`I am not in a voice channel.`);
    return;
  }

  if (connection.player.state.status === "idle") {
    await interaction.reply(`I am not playing anything.`);
    return;
  }

  connection.player.stop();
  await interaction.reply(`Skipped!`);
};

export const command = {
  data,
  execute,
};
