import { createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { stream } from "play-dl";

import { playerRow } from "../utils/actionBuilder.js";
import { createPlayerEmbed } from "../utils/embedBuilder.js";
import { getNextSong, setCurrentSong } from "./queue.js";
import bot from "../index.js";

export const playNext = async (guildId: string): Promise<boolean> => {
  const interaction = bot.interactions.get(guildId);
  if (!interaction) {
    console.log("Interaction not found!");
    return false;
  }

  const nextSong = getNextSong(guildId);
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
    setCurrentSong(guildId, -1);
    return false;
  }

  bot.playersOptions.set(guildId, {
    ...bot.playersOptions.get(guildId),
    visible: false,
  });

  if (nextSong) {
    const strm = await stream(nextSong.url, { quality: 2 }).catch(() => null);
    if (!strm) return false;

    bot.songs.set(guildId, nextSong);
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
    bot.songs.delete(guildId);
    bot.subscriptions.delete(guildId);
  }
  return true;
};
