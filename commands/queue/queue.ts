import {
  ButtonStyle,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ComponentType,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import {
  createAudioPlayer,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { Bot, Command } from "interfaces/discordjs.js";
import { play } from "../../services/play.js";
import { getQueue, getSong } from "../../services/queue.js";
import requireVoice from "../../requirements/requireVoice.js";
import requireSameVoiceChannel from "../../requirements/requireSameVoiceChannel.js";

const SONG_PER_PAGE = 15;
const setMessage = (interaction: CommandInteraction) => {
  const queue = getQueue(interaction.guild!.id);
  let index = 0,
    message;
  return function (page?: string): string {
    if (page === "prev") {
      index -= SONG_PER_PAGE;
      if (index < 0) index = 0;
    } else if (page === "next") {
      if (index + SONG_PER_PAGE < queue.songs.length) index += SONG_PER_PAGE;
    }

    message = queue.songs
      .slice(index, index + SONG_PER_PAGE)
      .map((song, i) => `${index + i + 1}. ${song.title}`)
      .join("\n");
    return `\`\`\`${message}\`\`\` \n\n${
      index / SONG_PER_PAGE + 1
    } / ${Math.ceil(queue.songs.length / SONG_PER_PAGE)}`;
  };
};
const data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Shows the current queue")
  .addStringOption((option) =>
    option.setName("index").setDescription("The index of the queue")
  );

const execute = async (interaction: CommandInteraction, bot: Bot) => {
  const prompt = (
    interaction.options as CommandInteractionOptionResolver
  ).getString("index")!;

  if (prompt) {
    let connection;
    if (!requireVoice(interaction)) return;
    if (!requireSameVoiceChannel(interaction))
      connection = joinVoiceChannel({
        channelId: (interaction.member as GuildMember)!.voice.channelId!,
        guildId: interaction.guild!.id,
        adapterCreator: interaction.guild!.voiceAdapterCreator,
      });
    else connection = getVoiceConnection(interaction.guild!.id)!;
    const index = parseInt(prompt);
    const song = getSong(interaction.guild!.id, index - 1);

    if (!song) {
      await interaction.reply(`Invalid index.`);
      return;
    }
    const player = createAudioPlayer();
    const subscription = connection.subscribe(player);

    if (!subscription) {
      await interaction.reply(`Error joining voice channel.`);
      return;
    } else {
      bot.subscriptions.set(interaction.guild!.id, subscription);
    }

    await interaction.deferReply();
    await interaction.editReply(`Playing: ${song.title}`);
    await play(interaction, subscription, bot, song.url, song.title);
    return;
  }

  const uptadeMessage = setMessage(interaction);
  let message = uptadeMessage();

  const prev = new ButtonBuilder()
    .setCustomId("prev")
    .setLabel("<")
    .setStyle(ButtonStyle.Primary);

  const next = new ButtonBuilder()
    .setCustomId("next")
    .setLabel(">")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prev, next);

  const response = await interaction.reply({
    content: message,
    components: [row],
  });

  //   const collectorFilter = (i) => i.user.id === interaction.user.id;

  try {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000,
    });
    collector.on("collect", async (confirmation) => {
      if (confirmation.customId === "prev") {
        message = uptadeMessage("prev");
        await confirmation.update({
          content: message,
          components: [row],
        });
      } else if (confirmation.customId === "next") {
        message = uptadeMessage("next");
        await confirmation.update({
          content: message,
          components: [row],
        });
      } else {
        await confirmation.update({
          content: message,
          components: [row],
        });
      }
    });
  } catch (e) {}
};

export const command: Command = {
  data,
  execute,
  reqiures: ["requireQueueNotEmpty", "requireSameVoiceChannel"],
};
