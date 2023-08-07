import { createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { stream } from "play-dl";
import { playerRow } from "../utils/actionBuilder.js";
import { createPlayerEmbed } from "../utils/embedBuilder.js";
import { getPrevSong, getQueueLength, setCurrentSong } from "./queue.js";
import bot from "../index.js";
export const playPrev = async (guildId) => {
    const interaction = bot.interactions.get(guildId);
    if (!interaction) {
        console.log("Interaction not found!");
        return false;
    }
    const prevSong = getPrevSong(guildId);
    const subscription = bot.subscriptions.get(guildId);
    const player = bot.players.get(guildId);
    if (!subscription) {
        if (!player) {
            console.log("Player not found!");
            return false;
        }
        const sub = getVoiceConnection(guildId)?.subscribe(player);
        if (!sub) {
            console.log("Subscription not found!");
            return false;
        }
        bot.subscriptions.set(guildId, sub);
        const index = getQueueLength(guildId);
        setCurrentSong(guildId, index);
        return false;
    }
    bot.playersOptions.set(guildId, {
        ...bot.playersOptions.get(guildId),
        visible: false,
    });
    if (prevSong) {
        const strm = await stream(prevSong.url, { quality: 2 }).catch(() => null);
        if (!strm)
            return false;
        bot.songs.set(guildId, prevSong);
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
        subscription.player.stop();
        subscription.unsubscribe();
        bot.songs.delete(guildId);
        bot.subscriptions.delete(guildId);
    }
    return true;
};
