import {
  AudioPlayerStatus,
  VoiceConnectionStatus,
  createAudioResource,
} from "@discordjs/voice";
import { stream } from "play-dl";
import { Bot } from "interfaces/discordjs";
import { createPlayerEmbed } from "../utils/embedBuilder.js";
import { playerRow } from "../utils/actionBuilder.js";
import { playNext } from "./playNext.js";
import { setCurrentSong } from "./queue.js";
import { ComponentType } from "discord.js";

export const play = async (guildId: string, bot: Bot): Promise<void> => {
  const interaction = bot.interactions.get(guildId);
  const subscription = bot.subscriptions.get(guildId);
  const song = bot.currentSong.get(guildId);

  if (!interaction) {
    console.log("Interaction not found!");
    return;
  }
  if (!(interaction?.replied || interaction?.deferred))
    await interaction.deferReply();
  if (!subscription || !song) {
    await interaction.editReply("Something went wrong!");
    return;
  }

  subscription.player.on(AudioPlayerStatus.Idle, async () => {
    const loop = bot.songAttributes.get(guildId)?.isLooping;
    if (loop) {
      const song = bot.currentSong.get(guildId)!;
      setCurrentSong(guildId, song.index! - 1);
    }
    await playNext(guildId, bot);
  });

  subscription.player.on("error", () => {
    interaction.editReply("Error playing song!");
    subscription.player.stop();
  });

  subscription.connection.on(VoiceConnectionStatus.Disconnected, () => {
    bot.subscriptions.delete(guildId);
    bot.currentSong.delete(guildId);
    bot.interactions.delete(guildId);
    bot.activeMessageIds.delete(interaction.guildId!);

    subscription.player.stop(true);
    subscription.unsubscribe();
    interaction.editReply({
      content: "Disconnected!",
      components: [],
      embeds: [],
    });
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
  bot.activeMessageIds.set(interaction.guildId!, response.id);
};
