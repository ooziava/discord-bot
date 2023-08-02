import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import {
  createAudioPlayer,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { type Bot, type Command } from "interfaces/discordjs.js";
import { addSongsToQueue } from "../../services/queue.js";
import { play } from "../../services/play.js";
import { search } from "../../services/search.js";
import requireSameVoiceChannel from "../../requirements/requireSameVoiceChannel.js";
import requireVoice from "../../requirements/requireVoice.js";

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
  let connection;
  if (!requireVoice(interaction)) return;
  if (!requireSameVoiceChannel(interaction))
    connection = joinVoiceChannel({
      channelId: (interaction.member as GuildMember)!.voice.channelId!,
      guildId: interaction.guild!.id,
      adapterCreator: interaction.guild!.voiceAdapterCreator,
    });
  else connection = getVoiceConnection(interaction.guild!.id)!;
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

  if (!bot.subscriptions.get(interaction.guild!.id)) {
    const newSubscription = connection.subscribe(player);
    if (!newSubscription) {
      interaction.editReply(`Error connecting to audio.`);
      return;
    }

    bot.subscriptions.set(interaction.guild!.id, newSubscription);
    play(interaction, newSubscription, bot, songs[0].url, songs[0].title);
    addSongsToQueue(interaction.guild!.id, songs, { isNewQueue: true });
  } else addSongsToQueue(interaction.guild!.id, songs);
};

export const command: Command = {
  data,
  execute,
  reqiures: ["requireSameVoiceChannel", "requireVoice"],
};
