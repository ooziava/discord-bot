import consola from "consola";
import {
  Message,
  ComponentType,
  SlashCommandBuilder,
  type StringSelectMenuInteraction,
} from "discord.js";

import searchInput from "../../components/selects/search.js";

import { SongService, GuildService, SearchService } from "../../services/index.js";
import { isURL, reply } from "../../utils/index.js";

import { type Autocomplete, type Data, type Execute } from "../../types/index.js";
import { ELEMENTS_PER_PAGE } from "../../constants/index.js";

export const data: Data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("Search for a song")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("The query to search for")
      .setRequired(true)
      .setAutocomplete(true)
  );

export const execute: Execute = async (_client, interaction, args) => {
  const query =
    interaction instanceof Message ? args?.join(" ") : interaction.options.getString("query", true);
  if (!query) {
    await reply(interaction, "Please provide a query to search for.", true);
    return;
  }
  if (isURL(query)) {
    const song = await SongService.isExist(query);
    if (song) {
      await GuildService.addToQueue(interaction.guildId, song._id);
      await reply(interaction, `Added to the queue.`);
      return;
    }
  }

  if (!(interaction instanceof Message)) await interaction.deferReply();
  else await interaction.reply("Searching for songs...");

  const videos = await SearchService.searchSongs(query, ELEMENTS_PER_PAGE);
  if (!videos || !videos.length) {
    await reply(interaction, "No songs found.", true);
    return;
  }

  const response = await reply(interaction, {
    // embeds: [searchInfoEmbed(videos)],
    components: [searchInput(videos)],
  });

  const filter = (i: StringSelectMenuInteraction) =>
    i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter,
    time: 30_000,
  });

  collector.on("end", async () => {
    try {
      await response.edit({ components: [searchInput(videos, true)] });
    } catch (error) {
      consola.error(error);
    }
  });

  collector.on("collect", async (i) => {
    try {
      const url = i.values[0];
      const video = videos.find((v) => v.url === url);
      if (!video) {
        await i.reply("Something went wrong. Please try again.");
        return;
      }

      const newSong = SongService.parseYoutubeVideo(video);
      const song = (await SongService.isExist(newSong.url)) || (await SongService.save(newSong));
      await GuildService.addToQueue(interaction.guildId, song._id);
      await i.reply(`Added to the queue.`);
      collector.stop();
    } catch (error) {
      try {
        consola.error(error);
        collector.stop();
        await i.reply("An error occurred");
      } catch (error) {
        consola.error(error);
      }
    }
  });
};

export const autocomplete: Autocomplete = async (interaction) => {
  const query = interaction.options.getFocused();
  if (!query || query.length < 3) {
    await interaction.respond([]);
    return;
  }

  const songs = await SongService.search(query, ELEMENTS_PER_PAGE);
  if (!songs || !songs.length) {
    await interaction.respond([]);
    return;
  }

  const filteredSongs = songs.map((song) => ({
    name: song.title,
    value: song.url,
  }));
  await interaction.respond(filteredSongs);
};
