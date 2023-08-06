import { SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
const data = new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leaves the voice channel you are in.");
const execute = async (interaction, bot) => {
    const connection = getVoiceConnection(interaction.guildId);
    if (connection) {
        connection.disconnect();
        bot.activeMessageIds.delete(interaction.guildId);
        await interaction.reply("Left voice channel!");
    }
};
export const command = {
    data,
    execute,
};
