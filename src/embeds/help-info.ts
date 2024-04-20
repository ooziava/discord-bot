import { EmbedBuilder } from "discord.js";

const defaultHelpFileds = [
  { name: "/play", value: "Play a song.", inline: true },
  { name: "/search", value: "Search for a song.", inline: true },
  { name: "/kill", value: "Stop the bot.", inline: true },
  {
    name: "/queue [q]",
    value: "Manage the music queue.",
    inline: false,
  },
  {
    name: "/playlist [pl]",
    value: "Manage playlists.",
    inline: false,
  },
  {
    name: "/next",
    value: "Skip to the next song",
    inline: true,
  },
  { name: "/pause", value: "Pause the current song.", inline: true },
  { name: "/loop", value: "Toggle looping.", inline: true },
  { name: "/volume", value: "Set the volume.", inline: true },
  { name: "/prefix", value: "Change the bot's command prefix.", inline: true },
  { name: "/info", value: "Get information about the bot.", inline: true },
];

const commandsHelp: { [key: string]: string } = {
  play: "Use `/play` to play a song from the queue or pass a URL to play a song instantly.",
  search:
    "Search for a song with the provided query. Select a song from the search results to add it to the queue.",
  queue:
    "Manage the music queue\n\nAliases(available only with prefix usage): [q]\nUsage: `queue [subcommand]`\n\nSubcommands:\n- `add [url]`: Add a song to the queue\n- `remove [name or url]`: Remove a song from the queue\n- `info`: Get list of songs in queue\n- `clear`: Remove all songs from the queue",
  playlist:
    "Manage playlists\n\nAliases(available only with prefix usage): [pl]\nUsage: `playlist [subcommand]`\n\nSubcommands:\n- `add [url]`: Save playlist\n- `play [name or orl]`: add songs from playlist to a queue\n- `info`: Get list of playlists. Pass name or url to get info about specified playlist\n- `remove [name or url]`: Remove a playlist\n\nCreate and modify coming soon.",
  next: "Skip to the next song in the queue. Optionally pass a number to skip multiple songs.",
  pause: "Pause the current song.",
  loop: "Toggle looping of the current song.",
  volume: "Set the volume of the music.",
  prefix: "Change the bot's command prefix.",
  kill: "Stop the bot and disconnect from the voice channel.",
  help: "Get help with the bot. Optionally pass a command to get help for that command.",
  info: "Get information about the bot.",
};

const defaultEmbed = new EmbedBuilder()
  .setTitle("Music Bot Help")
  .setColor(0x00008b)
  .setFooter({
    text: "Type `/help [command]` to get help for a specific command.",
  })
  .addFields(defaultHelpFileds);

export default function helpEmbed(command?: string) {
  if (!command) {
    return defaultEmbed;
  } else {
    const embed = new EmbedBuilder().setTitle("Music Bot Help").setColor(0x00008b).setFooter({
      text: "Type `/help [command]` to get help for a specific command.",
    });
    if (commandsHelp[command]) {
      embed.setFields({ name: command, value: commandsHelp[command], inline: false });
    } else {
      embed.setFields({ name: "Error", value: "Command not found.", inline: false });
    }
    return embed;
  }
}
