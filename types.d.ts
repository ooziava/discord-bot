type YouTubeVideo = import("play-dl").YouTubeVideo;

type MyClient = import("./index.js").MyClient;
type SpotifyType = "album" | "playlist" | "track";
type SoundCloudType = "playlist" | "track";
type YouTubeType = "playlist" | "video";

type ExecuteCommand = (
  interaction: import("discord.js").CommandInteraction,
  client: MyClient
) => Promise<any>;

type ExecuteButton = (
  interaction: import("discord.js").ButtonInteraction,
  client: MyClient
) => Promise<any>;

interface Command {
  data: import("discord.js").SlashCommandBuilder;
  execute: ExecuteCommand;
  cooldown?: number;
}

interface Button {
  data: import("discord.js").ButtonBuilder;
  execute: onPress;
  cooldown?: number;
}

interface Video extends YouTubeVideo {
  playlist?: {
    url: string;
    title: string;
    thumbnail: string;
  };
}

interface StoredSong {
  id?: number;
  url: string;
  title: string;
  duration: number;
  timestamp: number;
  thumbnail: string;
  playlist?: {
    url: string;
    title: string;
    thumbnail: string;
  };
  user: {
    name: string;
    thumbnail: string;
  };
  author: {
    url: string;
    name: string;
    thumbnail: string;
  };
}

type GetStoredSong = (guildId: string, id: number) => Promise<StoredSong | null>;
