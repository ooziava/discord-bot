import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, } from "@discordjs/voice";
import { stream } from "play-dl";
import { playerRow } from "../utils/actionBuilder.js";
import { createPlayerEmbed } from "../utils/embedBuilder.js";
import { getNextSongInQueue, setCurrentSong } from "./queue.js";
export const playNext = async (guildId, bot) => {
    const interaction = bot.interactions.get(guildId);
    if (!interaction) {
        console.log("Interaction not found!");
        return false;
    }
    const nextSong = getNextSongInQueue(guildId);
    let subscription = bot.subscriptions.get(guildId);
    if (!subscription) {
        const player = createAudioPlayer();
        subscription = getVoiceConnection(guildId)?.subscribe(player);
        if (!subscription) {
            console.log("Subscription not found!");
            return false;
        }
        player.on(AudioPlayerStatus.Idle, async () => {
            const loop = bot.songAttributes.get(guildId)?.isLooping;
            if (loop) {
                const song = bot.currentSong.get(guildId);
                setCurrentSong(guildId, song.index - 1);
            }
            const res = await playNext(guildId, bot);
            if (!res)
                playNext(guildId, bot);
        });
        bot.subscriptions.set(guildId, subscription);
        setCurrentSong(guildId, -1);
        return false;
    }
    bot.songAttributes.set(guildId, {
        ...bot.songAttributes.get(guildId),
        optionsVisible: false,
    });
    if (nextSong) {
        const strm = await stream(nextSong.url, { quality: 2 }).catch(() => null);
        if (!strm)
            return false;
        bot.currentSong.set(guildId, nextSong);
        const resource = createAudioResource(strm.stream, {
            inputType: strm.type,
        });
        subscription.player.play(resource);
        await interaction.editReply({
            content: " ",
            components: [playerRow()],
            embeds: [createPlayerEmbed(interaction, nextSong)],
        });
    }
    else {
        await interaction.editReply("Queue is empty!");
        subscription.player.stop();
        subscription.unsubscribe();
        bot.subscriptions.delete(guildId);
    }
    return true;
};
