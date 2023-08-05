import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";

import { Song, type Bot, type Command } from "interfaces/discordjs";
import { addSongsToQueue } from "../../services/queue.js";
import { play } from "../../services/play.js";
import { search } from "../../services/search.js";
import createConnection from "../../utils/createConnection.js";

const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) =>
    option.setName("song").setDescription("The song to play").setRequired(true)
  );

const execute = async (
  interaction: CommandInteraction,
  bot: Bot
): Promise<void> => {
  const prompt = (
    interaction.options as CommandInteractionOptionResolver
  ).getString("song")!;

  const connection = createConnection(interaction);
  if (!connection) return;

  await interaction.deferReply();
  let songs: Song[] = [];
  try {
    songs = await search(prompt);
  } catch (error) {
    interaction.editReply("Something went wrong.");
    return;
  }

  if (!songs.length) {
    interaction.editReply("No song found.");
    return;
  } else {
    await interaction.editReply(
      songs.length > 1
        ? `Added to queue: ${songs.length} songs from ${songs[0].playlist}`
        : `Added to queue: ${songs[0].title}`
    );
  }

  let isNewQueue = false;
  const player = createAudioPlayer();
  if (bot.subscriptions.has(interaction.guild!.id)) {
    addSongsToQueue(interaction.guild!.id, songs, { isNewQueue });
  } else {
    isNewQueue = true;
    const subscription = connection.subscribe(player)!;
    const song = addSongsToQueue(interaction.guild!.id, songs, { isNewQueue });

    bot.subscriptions.set(interaction.guild!.id, subscription);
    bot.currentSong.set(interaction.guild!.id, song);
    if (!bot.interactions.has(interaction.guild!.id))
      bot.interactions.set(interaction.guild!.id, interaction);

    play(interaction.guild!.id, bot);
  }
};

export const command: Command = {
  data,
  execute,
};
