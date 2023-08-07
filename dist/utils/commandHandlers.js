import { AudioPlayerStatus, getVoiceConnection } from "@discordjs/voice";
import { removeSong, setCurrentSong, shuffleQueue } from "../services/queue.js";
import { play } from "../services/play.js";
import { playPrev } from "../services/playPrev.js";
import { playNext } from "../services/playNext.js";
import { createPlayerEmbed } from "./embedBuilder.js";
import { playerOptionsRow, playerRow } from "./actionBuilder.js";
import bot from "../index.js";
export default async (interaction) => {
    if (interaction.isCommand()) {
        const command = bot.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            const reply = interaction?.replied || interaction?.deferred === true
                ? interaction?.followUp
                : interaction?.reply;
            if (reply) {
                try {
                    await reply({
                        content: "There was an error while executing this command!",
                        ephemeral: true,
                    });
                }
                catch (error) {
                    console.error(error);
                    interaction?.channel?.send("There was an error while executing this command!");
                }
            }
            else {
                console.error("Interaction object is undefined or does not have a reply or followUp method.");
            }
        }
    }
    else if (interaction.isButton()) {
        const id = bot.activeMessages.get(interaction.guild.id);
        const inter = bot.interactions.get(interaction.guild.id);
        if (!inter)
            return;
        if (id && id !== interaction.message?.id)
            return;
        const { subscriptions, songs, songAttributes, playersOptions } = bot;
        const subscription = subscriptions.get(interaction.guild.id);
        const song = songs.get(interaction.guild.id);
        const attributes = songAttributes.get(interaction.guild.id);
        const options = playersOptions.get(interaction.guild.id);
        if (subscription) {
            if (interaction.member?.voice.channel?.id !==
                subscription.connection.joinConfig.channelId) {
                await interaction.reply({
                    content: "You must be in the same voice channel as the bot!",
                    ephemeral: true,
                });
                return;
            }
        }
        switch (interaction.customId) {
            case "prev":
                let resPrev, countPrev = 0;
                do {
                    resPrev = await playPrev(interaction.guild.id);
                    countPrev++;
                } while (!resPrev && countPrev < 10);
                break;
            case "next":
                let resNext, countNext = 0;
                do {
                    resNext = await playNext(interaction.guild.id);
                    countNext++;
                } while (!resNext && countNext < 10);
                break;
            case "pause":
                if (subscription) {
                    if (subscription.player.state.status === AudioPlayerStatus.Paused) {
                        subscription.player.unpause();
                    }
                    else {
                        subscription.player.pause();
                    }
                    if (inter)
                        await inter.editReply({
                            content: " ",
                            components: [
                                playerRow(subscription.player.state.status === AudioPlayerStatus.Paused),
                            ],
                            embeds: [createPlayerEmbed(interaction, song)],
                        });
                }
                break;
            case "options":
                const optionsVisible = options?.visible === undefined ? true : !options?.visible;
                playersOptions.set(interaction.guild.id, {
                    ...options,
                    visible: optionsVisible,
                });
                if (inter) {
                    await inter.editReply({
                        content: " ",
                        components: optionsVisible
                            ? [
                                playerRow(),
                                playerOptionsRow(songAttributes.get(interaction.guild.id)?.loop || false),
                            ]
                            : [playerRow()],
                        embeds: [createPlayerEmbed(interaction, song)],
                    });
                }
                break;
            case "shuffle":
                const currSong = shuffleQueue(interaction.guild.id);
                await inter.editReply({
                    content: " ",
                    components: [playerRow()],
                    embeds: [createPlayerEmbed(interaction, currSong)],
                });
                break;
            case "loop":
                songAttributes.set(interaction.guild.id, {
                    ...attributes,
                    loop: !attributes?.loop,
                });
                await inter.editReply({
                    content: " ",
                    components: [
                        playerRow(),
                        playerOptionsRow(songAttributes.get(interaction.guild.id)?.loop || false),
                    ],
                    embeds: [createPlayerEmbed(interaction, song)],
                });
                break;
            case "remove":
                const index = songs.get(interaction.guild.id)?.index;
                if (index === undefined)
                    return;
                const result = removeSong(interaction.guild.id, index);
                if (result) {
                    setCurrentSong(interaction.guild.id, index - 1);
                    const res = await playNext(interaction.guild.id);
                    if (!res)
                        play(interaction.guild.id);
                }
                else {
                    await inter.editReply("Failed to remove song from queue!");
                }
                break;
            case "stop":
                if (subscription) {
                    subscription.player.stop();
                    subscription.unsubscribe();
                    bot.subscriptions.delete(interaction.guildId);
                }
                getVoiceConnection(interaction.guild.id)?.destroy();
                bot.activeMessages.delete(interaction.guildId);
                bot.interactions.delete(interaction.guildId);
                bot.players.delete(interaction.guildId);
                bot.songs.delete(interaction.guildId);
                bot.songAttributes.delete(interaction.guildId);
                bot.playersOptions.delete(interaction.guildId);
                await inter.editReply({
                    content: "Stopped playing!",
                    components: [],
                    embeds: [],
                });
                break;
            default:
                break;
        }
        if (!(interaction.customId === "options" || interaction.customId === "loop"))
            bot.playersOptions.set(interaction.guild.id, {
                ...bot.playersOptions.get(interaction.guild.id),
                visible: false,
            });
        await interaction.deferUpdate();
    }
    else if (interaction.isStringSelectMenu()) {
        // respond to the select menu
    }
};
