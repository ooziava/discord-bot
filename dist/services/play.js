import { AudioPlayerStatus, VoiceConnectionStatus, createAudioResource, } from "@discordjs/voice";
import { stream } from "play-dl";
import { createPlayerEmbed } from "../utils/embedBuilder.js";
import { playerRow } from "../utils/actionBuilder.js";
import { playNext } from "./playNext.js";
import { setCurrentSong } from "./queue.js";
import bot from "../index.js";
export const play = async (guildId) => {
    const interaction = bot.interactions.get(guildId);
    const subscription = bot.subscriptions.get(guildId);
    const song = bot.songs.get(guildId);
    const player = bot.players.get(guildId);
    if (!interaction) {
        console.log("Interaction not found!");
        return;
    }
    if (!subscription || !song || !player) {
        await interaction.reply("Something went wrong!");
        return;
    }
    if (!(interaction?.replied || interaction?.deferred))
        await interaction.deferReply();
    subscription.player.on(AudioPlayerStatus.Idle, async () => {
        if (!bot.songs.get(guildId))
            return;
        const loop = bot.songAttributes.get(guildId)?.loop;
        if (loop) {
            const song = bot.songs.get(guildId);
            setCurrentSong(guildId, song.index - 1);
        }
        let resNext, countNext = 0;
        do {
            resNext = await playNext(guildId);
            countNext++;
        } while (!resNext && countNext < 10);
    });
    subscription.player.on("error", () => {
        interaction.editReply("Error playing song!");
        subscription.player.stop();
    });
    subscription.connection.on(VoiceConnectionStatus.Disconnected, async () => {
        if (bot.subscriptions.has(interaction.guildId)) {
            bot.subscriptions.get(interaction.guildId)?.unsubscribe();
            bot.subscriptions.delete(interaction.guildId);
        }
        bot.activeMessages.delete(interaction.guildId);
        bot.players.delete(interaction.guildId);
        bot.songs.delete(interaction.guildId);
        bot.songAttributes.delete(interaction.guildId);
        try {
            const inter = bot.interactions.get(guildId);
            if (inter) {
                bot.interactions.delete(guildId);
                await inter.editReply({
                    content: "Disconnected!",
                    components: [],
                    embeds: [],
                });
            }
            else {
                await interaction.editReply({
                    content: "Disconnected!",
                    components: [],
                    embeds: [],
                });
            }
        }
        catch (error) {
            console.log(error.message);
        }
    });
    const str = await stream(song.url, { quality: 2 }).catch(() => null);
    if (!str) {
        subscription.player.emit(AudioPlayerStatus.Idle);
        return;
    }
    const resource = createAudioResource(str.stream, {
        inputType: str.type,
    });
    subscription.player.play(resource);
    const response = await interaction.editReply({
        content: " ",
        components: [playerRow()],
        embeds: [createPlayerEmbed(interaction, song)],
    });
    bot.activeMessages.set(interaction.guildId, response.id);
};
