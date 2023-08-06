import { createAudioPlayer, createAudioResource, getVoiceConnection, } from "@discordjs/voice";
import { stream } from "play-dl";
import { playerRow } from "../utils/actionBuilder.js";
import { createPlayerEmbed } from "../utils/embedBuilder.js";
import { getPrevSongInQueue, getQueueLength, getSong, setCurrentSong, } from "./queue.js";
export const playPrev = async (guildId, bot) => {
    const interaction = bot.interactions.get(guildId);
    if (!interaction) {
        console.log("Interaction not found!");
        return false;
    }
    let prevSong = getPrevSongInQueue(guildId);
    let subscription = bot.subscriptions.get(guildId);
    if (!subscription) {
        const player = createAudioPlayer();
        subscription = getVoiceConnection(guildId).subscribe(player);
        if (!subscription) {
            console.log("Subscription not found!");
            return false;
        }
        bot.subscriptions.set(guildId, subscription);
        const index = getQueueLength(guildId) - 1;
        setCurrentSong(guildId, index);
        prevSong = getSong(guildId, index);
    }
    bot.songAttributes.set(guildId, {
        ...bot.songAttributes.get(guildId),
        optionsVisible: false,
    });
    if (prevSong) {
        const strm = await stream(prevSong.url, { quality: 2 }).catch(() => null);
        if (!strm) {
            playPrev(guildId, bot);
            return false;
        }
        bot.currentSong.set(guildId, prevSong);
        const resource = createAudioResource(strm.stream, {
            inputType: strm.type,
        });
        subscription.player.play(resource);
        await interaction.editReply({
            content: " ",
            components: [playerRow()],
            embeds: [createPlayerEmbed(interaction, prevSong)],
        });
    }
    else {
        await interaction.editReply("Queue is empty!");
        subscription.player.stop();
        bot.subscriptions.delete(guildId);
    }
    return true;
};
