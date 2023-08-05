import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Bot, Command } from "interfaces/discordjs";
import checkUser from "../../utils/checkUser.js";

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip the current song");

const execute = async (interaction: CommandInteraction, bot: Bot) => {
  const channel = checkUser(interaction);
  if (!channel) return;

  const subscription = bot.subscriptions.get(channel.guildId);
  if (!subscription) {
    await interaction.reply({
      content: "There is no song playing.",
      ephemeral: true,
    });
    return;
  }

  const player = subscription.player;
  if (player.state.status === "idle") {
    await interaction.reply({
      content: "There is no song playing.",
      ephemeral: true,
    });
  } else {
    player.stop();
    await interaction.reply({
      content: "Skipped the current song.",
      ephemeral: true,
    });
  }
};

export const command: Command = {
  data,
  execute,
};
