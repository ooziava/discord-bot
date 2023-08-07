import { SlashCommandBuilder } from "discord.js";
import { checkUser } from "../../utils/checkUser.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import bot from "../../index.js";
const data = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song");
const execute = async (interaction) => {
    const channel = checkUser(interaction);
    if (!channel)
        return;
    const player = bot.players.get(interaction.guildId);
    if (!player) {
        await interaction.reply({
            content: "There is no song playing.",
            ephemeral: true,
        });
        return;
    }
    if (player.state.status === AudioPlayerStatus.Idle) {
        await interaction.reply({
            content: "There is no song playing.",
            ephemeral: true,
        });
    }
    else {
        player.stop();
        await interaction.reply({
            content: "Skipped the current song.",
            ephemeral: true,
        });
    }
};
export const command = {
    data,
    execute,
    voice: true,
};
