type YouTubeVideo = import("play-dl").YouTubeVideo;

type CommandData = import("discord.js").SlashCommandBuilder<any>;
type Execute = (
  interaction: import("discord.js").CommandInteraction,
  client: import("./index.js").MyClient
) => Promise<void>;

type SpotifyType = "album" | "playlist" | "track";
type SoundCloudType = "playlist" | "track";
type YouTubeType = "playlist" | "video";

interface Command {
  data: CommandData;
  execute: Execute;
  cooldown?: number;
}

interface Track extends YouTubeVideo {
  playlist?: {
    title: string;
    url: string;
  };
}

interface Song {
  id?: number;
  url: string;
  title: string;
  duration: number;
  timestamp: number;
  thumbnail: string;
  playlist?: {
    title: string;
    url: string;
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
