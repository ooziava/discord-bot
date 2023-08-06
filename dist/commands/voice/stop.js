import { SlashCommandBuilder } from "discord.js";
import checkUser from "../../utils/checkUser.js";
const data = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the current song");
const execute = async (interaction, bot) => {
    const channel = checkUser(interaction);
    if (!channel)
        return;
    const subscription = bot.subscriptions.get(channel.guildId);
    if (subscription) {
        subscription.player.stop();
        subscription.unsubscribe();
        bot.subscriptions.delete(channel.guildId);
        await interaction.reply("Stopped!");
    }
    else {
        await interaction.reply({
            content: "There is no song playing.",
            ephemeral: true,
        });
    }
};
export const command = {
    data,
    execute,
};
