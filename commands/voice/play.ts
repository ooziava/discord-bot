import {
  CommandInteraction,
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

const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) =>
    option.setName("song").setDescription("The song to play").setRequired(true)
  );

const execute = async (
  interaction: CommandInteraction,
  bot: Bot | undefined
): Promise<void> => {
  const prompt = interaction.options.data[0].value as string;
  const {
    voice: { channel },
  } = interaction.member as GuildMember;

  if (!channel) {
    await interaction.reply(`You are not in a voice channel.`);
    return;
  }

  const connection =
    getVoiceConnection(channel.guildId) ||
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

  interaction.deferReply();
  const songs = await search(prompt);

  if (!songs?.length) {
    interaction.editReply(`No song found.`);
    return;
  }
  const player = createAudioPlayer();

  let options = null;
  if (!bot?.subscriptions.get(interaction.guild!.id)) {
    const newSubscription = connection.subscribe(player);
    if (!newSubscription) {
      await interaction.editReply(`Error connecting to audio.`);
      return;
    }
    bot?.subscriptions.set(interaction.guild!.id, newSubscription);
    play(interaction, songs[0].title, newSubscription, bot);
    options = { newQueue: true };
  }
  addSongsToQueue(interaction.guild!.id, songs, options);
  interaction.editReply(`Added to queue: ${songs[0].title}`);
};

export const command: Command = {
  data,
  execute,
};
