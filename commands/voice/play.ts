import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";

import { type Bot, type Command } from "interfaces/discordjs";
import { addSongsToQueue, getSong } from "../../services/queue.js";
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
  const songs = await search(prompt).catch(() => {
    interaction.editReply(`Error searching for song.`);
    return [];
  });

  if (!songs.length) {
    interaction.editReply(`No song found.`);
    return;
  }

  const reply =
    songs.length > 1
      ? `Added to queue: ${songs.length} songs from ${songs[0].playlist}`
      : `Added to queue: ${songs[0].title}`;
  await interaction.editReply(reply);

  const player = createAudioPlayer();
  let isNewQueue = false;
  if (!bot.subscriptions.get(interaction.guild!.id)) {
    const newSubscription = connection.subscribe(player)!;

    bot.subscriptions.set(interaction.guild!.id, newSubscription);
    isNewQueue = true;
    const index = addSongsToQueue(interaction.guild!.id, songs, { isNewQueue });
    const song = getSong(interaction.guild!.id, index)!;
    play(interaction, bot, song);
  } else addSongsToQueue(interaction.guild!.id, songs, { isNewQueue });
};

export const command: Command = {
  data,
  execute,
};
