import {
  AudioPlayerStatus,
  PlayerSubscription,
  createAudioResource,
} from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { stream } from "play-dl";
import { Bot } from "interfaces/discordjs.js";
import { getNextSongInQueue } from "./queue.js";

export const play = async (
  interaction: CommandInteraction,
  songUrl: string,
  subscription: PlayerSubscription,
  bot: Bot
): Promise<void> => {
  const strm = await stream(songUrl, { quality: 2 });
  const resource = createAudioResource(strm.stream, { inputType: strm.type });
  subscription.player.play(resource);

  subscription.player.once(AudioPlayerStatus.Idle, async () => {
    const nextSong = getNextSongInQueue(interaction.guild!.id);

    if (nextSong) {
      const { title, url } = nextSong;
      await interaction.channel?.send(`Now playing: ${title}`);
      await play(interaction, url, subscription, bot);
    } else {
      await interaction.channel?.send("Queue is empty!");
      subscription.player.stop();
      subscription.unsubscribe();
      bot?.subscriptions.delete(interaction.guild!.id);
    }
  });

  subscription.player.on("error", () => {
    interaction.channel?.send("Error playing song!");
    subscription.player.stop();
  });
};
