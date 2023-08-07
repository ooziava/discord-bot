import {
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";

import { type Command, Execute } from "interfaces/discordjs";
import { play } from "../../services/play.js";
import {
  findSong,
  getSongByIndex,
  setCurrentSong,
} from "../../services/queue.js";
import { createConnection } from "../../utils/createConnection.js";
import bot from "../../index.js";

const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) =>
    option.setName("find").setDescription("Find song in queue")
  )
  .addStringOption((option) =>
    option.setName("index").setDescription("Play song by index")
  );

const execute: Execute = async (interaction) => {
  const query = (
    interaction.options as CommandInteractionOptionResolver
  ).getString("find");

  const index = (
    interaction.options as CommandInteractionOptionResolver
  ).getInteger("index");

  if (!query && !index) interaction.reply("Please provide a query or index");

  const connection = createConnection(interaction);
  if (!connection) return;

  const song = query
    ? findSong(interaction.guildId!, query)
    : getSongByIndex(interaction.guildId!, index! - 1);

  if (!song) {
    await interaction.reply("Song not found.");
    return;
  }

  if (bot.subscriptions.has(interaction.guild!.id)) {
    bot.songs.set(interaction.guild!.id, song);
    setCurrentSong(interaction.guild!.id, song.index! - 1)
      ? await interaction.reply({
          content: `Next song: ${song.title}`,
          ephemeral: true,
        })
      : await interaction.reply({
          content: "Invalid index",
          ephemeral: true,
        });
  } else {
    let player;

    if (!bot.players.has(interaction.guild!.id)) {
      player = createAudioPlayer();
      bot.players.set(interaction.guild!.id, player);
    } else {
      player = bot.players.get(interaction.guild!.id)!;
    }

    const subscription = connection.subscribe(player)!;
    bot.subscriptions.set(interaction.guild!.id, subscription);
    bot.songs.set(interaction.guild!.id, song);

    if (!bot.interactions.has(interaction.guild!.id))
      bot.interactions.set(interaction.guild!.id, interaction);

    setCurrentSong(interaction.guild!.id, song.index!);
    await play(interaction.guildId!);
  }
};

export const command: Command = {
  data,
  execute,
  voice: true,
};
