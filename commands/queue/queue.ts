import {
  ButtonInteraction,
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";

import { Bot, Command } from "interfaces/discordjs";
import { play } from "../../services/play.js";
import {
  getQueueLength,
  getSong,
  setCurrentSong,
} from "../../services/queue.js";
import { setSongList } from "../../utils/queueMessage.js";
import createConnection from "../../utils/createConnection.js";
import { paginationRow } from "../../utils/actionBuilder.js";
import { createPagination } from "../../utils/actionHandlers.js";

const data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Shows the current queue")
  .addStringOption((option) =>
    option.setName("index").setDescription("The index of the queue")
  );

const execute = async (
  interaction: CommandInteraction,
  bot: Bot
): Promise<void> => {
  const prompt = (
    interaction.options as CommandInteractionOptionResolver
  ).getString("index")!;

  if (prompt) {
    const connection = createConnection(interaction);
    if (!connection) return;

    const index =
      prompt === "last"
        ? getQueueLength(interaction.guildId!) - 1
        : parseInt(prompt) - 1;
    const song = getSong(interaction.guild!.id, index);

    if (!song) {
      await interaction.reply(`Invalid index.`);
      return;
    }
    const player = createAudioPlayer();
    await interaction.deferReply();

    let subscription = bot.subscriptions.get(interaction.guild!.id);
    if (!subscription) {
      await interaction.editReply(`Playing: ${song.title}`);
      subscription = connection.subscribe(player)!;
      bot.subscriptions.set(interaction.guild!.id, subscription);
      await play(interaction, bot, song);
      setCurrentSong(interaction.guild!.id, index);
    } else {
      setCurrentSong(interaction.guild!.id, index - 1);
      await interaction.editReply(`Next song: ${song.title}`);
    }
    return;
  }

  const updateSongList = setSongList(interaction);
  let message = updateSongList();

  const row = paginationRow();

  const response = await interaction.reply({
    content: message,
    components: [row],
  });
  const nextPage = async (confirmation: ButtonInteraction) => {
    message = updateSongList("next");
    await confirmation.update({
      content: message,
      components: [row],
    });
  };

  const previousPage = async (confirmation: ButtonInteraction) => {
    message = updateSongList("prev");
    await confirmation.update({
      content: message,
      components: [row],
    });
  };
  await createPagination(interaction, response, nextPage, previousPage);
};

export const command: Command = {
  data,
  execute,
};
