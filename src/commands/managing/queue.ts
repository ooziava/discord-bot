import { SlashCommandBuilder, Message } from "discord.js";
import SongService from "../../services/song.js";
import SearchService from "../../services/search.js";
import type { Aliases, Autocomplete, Data, Execute } from "../../types/command.js";

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
        interaction instanceof Message ? args?.[1] : interaction.options.getString("song");
      if (!url) return await interaction.reply("Please provide a URL to add.");

      let song = await SongService.getByUrl(url);
      if (!song) {
        const result = await SearchService.search(url);
        const newSong = SearchService.youtubeVideoToSong(result[0]);
        song = await SongService.save(newSong);
      }

      await interaction.reply(`Added song ${song.title} to the queue`);
      break;
    case "remove":
      const search =
        interaction instanceof Message
          ? args?.slice(1).join(" ")
          : interaction.options.getString("song");
      if (!search) return await interaction.reply("Please provide a song name or url to remove.");
      await interaction.reply(`Removing song ${search} from the queue`);
      break;
    case "info":
      await interaction.reply("Getting information about the queue");
      break;
    case "clear":
      await interaction.reply("Clearing the queue");
      break;
    default:
      await interaction.reply("Please provide a subcommand.");
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
