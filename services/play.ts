import { AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { stream } from "play-dl";
import { Bot, Song } from "interfaces/discordjs";
import { getNextSongInQueue } from "./queue.js";
import { createPlayerEmbed } from "../utils/embedBuilder.js";
import {
  featureRow,
  playerOptionsRow,
  playerRow,
} from "../utils/actionBuilder.js";
import { createPlayer } from "../utils/actionHandlers.js";

export const play = async (
  interaction: CommandInteraction,
  bot: Bot,
  firstSong: Song
): Promise<void> => {
  const subscription = bot.subscriptions.get(interaction.guild!.id)!;
  const timastamp = Date.now();
  let song = firstSong;

  subscription.player.on(AudioPlayerStatus.Idle, async () => {
    const nextSong = getNextSongInQueue(interaction.guild!.id);

    if (nextSong) {
      song = nextSong;
      const strm = await stream(nextSong.url, { quality: 2 });
      const resource = createAudioResource(strm.stream, {
        inputType: strm.type,
      });
      subscription.player.play(resource);
      await interaction.editReply({
        content: " ",
        components: [playerRow()],
        embeds: [createPlayerEmbed(interaction, song, timastamp)],
      });
    } else {
      await interaction.editReply("Queue is empty!");
      subscription.player.stop();
      subscription.unsubscribe();
      bot.subscriptions.delete(interaction.guild!.id);
    }
  });

  subscription.player.on("error", () => {
    interaction.editReply("Error playing song!");
    subscription.player.stop();
  });

  const response = await interaction.editReply({
    content: " ",
    components: [playerRow()],
    embeds: [createPlayerEmbed(interaction, song, timastamp)],
  });
  await createPlayer(interaction, response, bot, song);
};
