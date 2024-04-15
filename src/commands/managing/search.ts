import {
  SlashCommandBuilder,
  Message,
  ComponentType,
  type StringSelectMenuInteraction,
} from "discord.js";
import type { Autocomplete, Data, Execute } from "../../types/command.js";
import reply from "../../utils/reply.js";
import SongService from "../../services/song.js";
import SearchService from "../../services/search.js";
import searchInput from "../../components/search-select.js";
import GuildService from "../../services/guild.js";
import { isURL } from "../../utils/urls.js";

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

export const execute: Execute = async (interaction, args) => {
  const query =
    interaction instanceof Message ? args?.join(" ") : interaction.options.getString("query", true);
  if (!query) return await reply(interaction, "Please provide a query to search for.", true);

  if (isURL(query)) {
    const song = await SongService.getByUrl(query);
    if (song) {
      await GuildService.addToQueue(interaction.guildId, song._id);
      return await reply(interaction, `Added [${song.title}](${song.url}) to the queue.`);
    }
  }

  const videos = await SearchService.searchSong(query, 10);
  if (!videos || !videos.length) return await reply(interaction, "No songs found.", true);

  return await reply(interaction, {
    components: [searchInput(videos)],
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
