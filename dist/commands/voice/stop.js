import { SlashCommandBuilder } from "discord.js";
import { checkUser } from "../../utils/checkUser.js";
import bot from "../../index.js";
const data = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the current song");
const execute = async (interaction) => {
    const channel = checkUser(interaction);
    if (!channel)
        return;
    if (bot.subscriptions.has(channel.guildId)) {
        const sub = bot.subscriptions.get(channel.guildId);
        sub.player.stop();
        sub.unsubscribe();
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
    voice: true,
};
