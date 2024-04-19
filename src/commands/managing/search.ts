import {
  Message,
  ComponentType,
  SlashCommandBuilder,
  type StringSelectMenuInteraction,
} from "discord.js";

import searchInput from "../../components/selects/search.js";

import { SongService, GuildService, SearchService } from "../../services/index.js";
import { isURL, reply } from "../../utils/index.js";

import { type Autocomplete, type Data, type Execute, ActionsEnum } from "../../types/index.js";

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

export const execute: Execute = async (client, interaction, args) => {
  const query =
    interaction instanceof Message ? args?.join(" ") : interaction.options.getString("query", true);
  if (!query) return await reply(interaction, "Please provide a query to search for.", true);

  if (isURL(query)) {
    const song = await SongService.getByUrl(query);
    if (song) {
      await GuildService.addToQueue(interaction.guildId, song._id);
      return await reply(interaction, `Added **${song.title}** to the queue.`);
    }
  }

  const videos = await SearchService.searchSong(query, 15);
  if (!videos || !videos.length) return await reply(interaction, "No songs found.", true);

  const response = await reply(interaction, {
    // embeds: [searchInfoEmbed(videos)],
    components: [searchInput(videos)],
  });

  const filter = (i: StringSelectMenuInteraction) =>
    i.customId === ActionsEnum.SearchSelect &&
    i.user.id === (interaction instanceof Message ? interaction.author.id : interaction.user.id);

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter,
    time: 30_000,
  });

  collector.on("end", async () => {
    await response.edit({ components: [searchInput(videos, true)] });
  });

  return collector.on("collect", async (i) => {
    const url = i.values[0];
    const video = await SearchService.getSongByURL(url);
    if (!video) return;

    const newSong = SongService.parseYoutubeVideo(video);
    const stored = await SongService.getByUrl(newSong.url);
    const song = stored || (await SongService.save(newSong));
    await GuildService.addToQueue(interaction.guildId, song._id);
    await i.reply(`Added [${song.title}](${song.url}) to the queue.`);
    collector.stop();
  });
};

export const autocomplete: Autocomplete = async (interaction) => {
  const query = interaction.options.getFocused();
  if (!query || query.length < 3) return await interaction.respond([]);

  const songs = await SongService.search(query);
  if (!songs || !songs.length) return await interaction.respond([]);

  return await interaction.respond(
    songs.slice(0, 15).map((song) => ({
      name: song.title,
      value: song.url,
    }))
  );
};
