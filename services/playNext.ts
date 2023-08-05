import {
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
} from "@discordjs/voice";
import { stream } from "play-dl";
import { Bot } from "interfaces/discordjs.js";

import { getNextSongInQueue, getSong, setCurrentSong } from "./queue.js";
import { playerRow } from "../utils/actionBuilder.js";
import { createPlayerEmbed } from "../utils/embedBuilder.js";

export const playNext = async (guildId: string, bot: Bot): Promise<void> => {
  const interaction = bot.interactions.get(guildId);
  if (!interaction) {
    console.log("Interaction not found!");
    return;
  }

  let nextSong = getNextSongInQueue(guildId);
  let subscription = bot.subscriptions.get(guildId);
  if (!subscription) {
    const player = createAudioPlayer();
    subscription = getVoiceConnection(guildId)!.subscribe(player);
    if (!subscription) {
      console.log("Subscription not found!");
      return;
    }
    bot.subscriptions.set(guildId, subscription);
    setCurrentSong(guildId, 0);
    nextSong = getSong(guildId, 0);
  }

  bot.songAttributes.set(guildId, {
    ...bot.songAttributes.get(guildId),
    optionsVisible: false,
  });

  if (nextSong) {
    const strm = await stream(nextSong.url, { quality: 2 }).catch(() => null);
    if (!strm) {
      playNext(guildId, bot);
      return;
    }
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
  } else {
    await interaction.editReply("Queue is empty!");
    subscription.player.stop();
    subscription.unsubscribe();
    bot.subscriptions.delete(guildId);
  }
};
