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
  bot: Bot | undefined
): Promise<void> => {
  const strm = await stream(songUrl, { quality: 2 });
  const resource = createAudioResource(strm.stream, { inputType: strm.type });
  subscription.player.play(resource);

  subscription.player.once(AudioPlayerStatus.Idle, () => {
    const nextSong = getNextSongInQueue(interaction.guild!.id);

    if (nextSong) {
      const { title, url } = nextSong;
      interaction.channel?.send(`Now playing: ${title}`);
      play(interaction, url, subscription, bot);
    } else {
      interaction.channel?.send("Queue is empty!");
      subscription.player.stop();
      subscription?.unsubscribe();
      bot?.subscriptions.set(interaction.guild!.id, undefined!);
    }
  });

  subscription.player.on("error", () => {
    interaction.channel?.send("Error playing song!");
    subscription.player.stop();
  });
};
