import {
  NoSubscriberBehavior,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import consola from "consola";
import { CommandInteractionOptionResolver, GuildMember, SlashCommandBuilder } from "discord.js";
import {
  search,
  so_validate,
  sp_validate,
  stream,
  yt_validate,
  spotify,
  soundcloud,
  is_expired,
  refreshToken,
  YouTubeVideo,
  type Spotify,
  SpotifyTrack,
} from "play-dl";

async function getType(query: string): Promise<[string, string] | false> {
  const spType = sp_validate(query);
  if (spType) {
    return ["sp", spType];
  }

  const soType = await so_validate(query);
  if (soType) {
    return ["so", soType];
  }

  const ytType = yt_validate(query);
  if (ytType) {
    return ["yt", ytType];
  }

  return false;
}

async function searchYt(query: string): Promise<YouTubeVideo> {
  const results = await search(query, { limit: 1, source: { youtube: "video" } });
  return results[0]!;
}

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Plays a song")
  .addStringOption((option) =>
    option.setName("song").setDescription("The song to play").setRequired(true)
  );

export const execute: Execute = async (interaction, client) => {
  await interaction.deferReply();
  if (is_expired()) await refreshToken();

  const query = (interaction.options as CommandInteractionOptionResolver).getString("song")!;
  const type = await getType(query);
  if (!type) {
    await interaction.reply({
      content: "Invalid song!",
      ephemeral: true,
    });
    return;
  }
  const [social, media] = type;

  let songs = [];
  if (media === "search") {
    songs.push(await searchYt(query));
  } else if (social === "sp") {
    const song = await spotify(query);
    if (song instanceof SpotifyTrack) {
      const q = song.name + song.artists.reduce((a, b) => a + " " + b, "");
      songs.push(await searchYt(q));
    } else {
      const tracks = await song.all_tracks();
      consola.log(tracks.length);
      const playlist = await Promise.all(
        tracks.map(async (track) => {
          return await searchYt(track.name + track.artists.reduce((a, b) => a + " " + b, ""));
        })
      );
      songs = playlist;
    }
  } else if (social === "yt") {
    songs = await search(query, { source: { youtube: "video" } });
  } else {
    await interaction.followUp({
      content: "Invalid song!",
      ephemeral: true,
    });
    return;
  }

  if (!songs.length) {
    await interaction.followUp({
      content: "No results found!",
      ephemeral: true,
    });
    return;
  }

  const connection = joinVoiceChannel({
    channelId: (interaction.member as GuildMember).voice.channelId!,
    guildId: interaction.guildId!,
    adapterCreator: interaction.guild!.voiceAdapterCreator,
  });

  const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
  const audiostream = await stream(songs[0].url, { quality: 2 });
  const resource = createAudioResource(audiostream.stream, {
    inputType: audiostream.type,
    inlineVolume: true,
  });

  connection.subscribe(player);
  player.play(resource);

  await interaction.followUp({
    content: `Now playing ${songs[0].title} (${media}, ${social})`,
  });
};
