type YouTubeVideo = import("play-dl").YouTubeVideo;

type MyClient = import("./index.js").MyClient;
type SpotifyType = "album" | "playlist" | "track";
type SoundCloudType = "playlist" | "track";
type YouTubeType = "playlist" | "video";

type Execute = (
  interaction: import("discord.js").CommandInteraction,
  client: MyClient
) => Promise<void>;

type OnPress = (
  interaction: import("discord.js").ButtonInteraction,
  client: MyClient
) => Promise<void>;

interface Command {
  data: import("discord.js").SlashCommandBuilder<any>;
  execute: Execute;
  cooldown?: number;
}

interface Button {
  data: import("discord.js").ButtonBuilder<any>;
  execute: onPress;
  cooldown?: number;
}

interface Track extends YouTubeVideo {
  playlist?: {
    url: string;
    title: string;
    thumbnail: string;
  };
}

type GetSong = (guildId: string, id: number) => Promise<Song | null>;

interface Song {
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
