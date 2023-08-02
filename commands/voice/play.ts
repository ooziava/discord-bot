import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import {
  AudioPlayerStatus,
  PlayerSubscription,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { search, stream } from "play-dl";
import { addSongToQueue, getNextSongInQueue } from "../../services/queue.js";
import { type Bot, type Command } from "interfaces/discordjs.js";

const play = async (
  interaction: CommandInteraction,
  songUrl: string,
  subscription: PlayerSubscription,
  bot: Bot | undefined
): Promise<void> => {
  const strm = await stream(songUrl, { quality: 2 });
  const resource = createAudioResource(strm.stream, { inputType: strm.type });
  subscription.player.play(resource);

  subscription.player.once(AudioPlayerStatus.Idle, () => {
    console.log("idle");
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

  subscription.player.on("error", (err) => {
    interaction.editReply("Error playing song!");
    subscription.player.stop();
  });
};

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
  let song;
  try {
    interaction.deferReply();
    song = await search(prompt ?? "", {
      limit: 1,
      source: {
        youtube: "video",
      },
    });
  } catch (error) {
    console.log(error);
  }
  if (!song) {
    await interaction.editReply(`No song found.`);
    return;
  }
  const songName = song[0].title ?? "";
  const songUrl = song[0].url ?? "";
  const songDuration = song[0].durationInSec ?? 0;
  const songThumbnail = song[0].thumbnails[0].url ?? "";
  const player = createAudioPlayer();

  let options = null;
  if (!bot?.subscriptions.get(interaction.guild!.id)) {
    const newSubscription = connection.subscribe(player);
    if (!newSubscription) {
      await interaction.editReply(`Error connecting to audio.`);
      return;
    }
    bot?.subscriptions.set(interaction.guild!.id, newSubscription);
    play(interaction, songUrl, newSubscription, bot);
    options = { newQueue: true };
  }
  addSongToQueue(
    interaction.guild!.id,
    {
      title: songName,
      url: songUrl,
      duration: songDuration,
      thumbnail: songThumbnail,
    },
    options
  );
  interaction.editReply(`Added to queue: ${songName}`);
};

export const command: Command = {
  data,
  execute,
};
