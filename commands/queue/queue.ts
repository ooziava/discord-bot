import {
  ButtonStyle,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ComponentType,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { getQueue, getSong } from "../../services/queue.js";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { play } from "../../services/play.js";
import {
  createAudioPlayer,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { Bot } from "interfaces/discordjs.js";

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
    const {
      voice: { channel },
    } = interaction.member as GuildMember;

    if (!channel) {
      await interaction.reply(`You are not in a voice channel.`);
      return;
    }
    let connection = getVoiceConnection(interaction.guild!.id);
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild!.id,
        adapterCreator: interaction.guild!.voiceAdapterCreator,
      });
    }
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

    await interaction.reply(`Playing: ${song.title}`);
    await play(interaction, song.url, subscription, bot);
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

export const command = {
  data,
  execute,
};
