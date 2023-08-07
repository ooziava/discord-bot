import { SlashCommandBuilder } from "discord.js";
import { createConnection } from "../../utils/createConnection.js";
const data = new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins the voice channel you are in.");
const execute = async (interaction) => {
    const connection = createConnection(interaction);
    if (connection)
        await interaction.reply("Joined voice channel!");
};
export const command = {
    data,
    execute,
    voice: true,
};
