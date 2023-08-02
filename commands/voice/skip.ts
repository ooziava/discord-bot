import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Bot, Command } from "interfaces/discordjs.js";

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip the current song");

const execute = async (interaction: CommandInteraction, bot: Bot) => {
  const channel = (interaction.member as GuildMember).voice.channel!;
  const { player } = bot.subscriptions.get(channel.guildId)!;

  if (player.state.status === "idle") {
    await interaction.reply(`I am not playing anything.`);
  } else {
    player.stop();
    await interaction.reply(`Skipped!`);
  }
};

export const command: Command = {
  data,
  execute,
  reqiures: ["requireSameVoiceChannel"],
};
