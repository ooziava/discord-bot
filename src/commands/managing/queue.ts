import { SlashCommandBuilder, Message } from "discord.js";
import SongService from "../../services/song.js";
import SearchService from "../../services/search.js";
import type { Aliases, Autocomplete, Data, Execute } from "../../types/command.js";
import reply from "../../utils/reply.js";
import GuildService from "../../services/guild.js";

export const aliases: Aliases = "q";
export const data: Data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Manage the queue")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Add a song to the queue")
      .addStringOption((option) =>
        option
          .setName("song")
          .setDescription("The URL of the song to add")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove a song from the queue")
      .addStringOption((option) =>
        option.setName("song").setDescription("The song to remove").setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("info").setDescription("Get information about the queue")
  )
  .addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Clear the queue"));

export const execute: Execute = async (interaction, args) => {
  const subcommand =
    interaction instanceof Message ? args?.[0] : interaction.options.getSubcommand();

  switch (subcommand) {
    case "add":
      const url =
        interaction instanceof Message ? args?.[1] : interaction.options.getString("song", true);
      if (!url) return await reply(interaction, "Please provide a URL to add.", true);

      let song = await SongService.getByUrl(url);
      if (!song) {
        const result = await SearchService.searchSong(url);
        if (!result || !result.length) return await reply(interaction, "No results found.", true);

        const newSong = SongService.parseYoutubeVideo(result[0]);
        song = await SongService.save(newSong);
      }

      await GuildService.addToQueue(interaction.guildId, song._id);
      return await reply(interaction, `Added to queue: ${song.title}`);
    case "remove":
      const search =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("song");
      if (!search)
        return await reply(interaction, "Please provide a song name or url to remove.", true);

      return await reply(interaction, "Available soon");
    case "info":
      return await reply(interaction, "Available soon");
    case "clear":
      return await reply(interaction, "Available soon");
    default:
      return await reply(interaction, "Please provide a subcommand.", true);
  }
};
export const autocomplete: Autocomplete = async (interaction) => {
  const focusedValue = interaction.options.getFocused().toLocaleLowerCase();
  const choices = [
    "Popular Topics: Threads",
    "Sharding: Getting started",
    "Library: Voice Connections",
    "Interactions: Replying to slash commands",
    "Popular Topics: Embed preview",
  ];

  const filtered = choices.filter((choice) => choice.toLocaleLowerCase().startsWith(focusedValue));
  await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
};
