import { SlashCommandBuilder, Message, GuildMember } from "discord.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import { validate } from "play-dl";

import songInfoEmbed from "../../embeds/song-info.js";

import { GuildService, SearchService, SongService } from "../../services/index.js";
import { reply, connectToChannel, createPlayer, playSong } from "../../utils/index.js";

import { type Data, type Execute, SourceEnum } from "../../types/index.js";

export const data: Data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) => option.setName("url").setDescription("The URL of the song to play"));

export const execute: Execute = async (client, interaction, args) => {
  const url = interaction instanceof Message ? args?.[0] : interaction.options.getString("url");

  const member = interaction.member;
  if (!(member instanceof GuildMember) || !member.voice.channel)
    return await reply(interaction, "You need to be in a voice channel to play a song");

  let song;
  if (!url) {
    song = await GuildService.getCurrentSong(interaction.guildId);
    if (!song) return await reply(interaction, "No song in queue");

    await reply(interaction, "Playing last song in queue");
  } else {
    if (interaction instanceof Message) await reply(interaction, "Searching for song...");
    else await interaction.deferReply();

    const result = await validate(url).catch(() => null);
    let source: SourceEnum;
    switch (result) {
      case "yt_video":
      case "yt_playlist":
        source = SourceEnum.Youtube;
        break;
      case "sp_track":
        source = SourceEnum.Spotify;
        break;
      default:
        return await reply(interaction, "Invalid URL.");
    }

    const video = await SearchService.getSongByURL(url, { source });
    if (!video) return await reply(interaction, "Song not found");

    song = SongService.parseYoutubeVideo(video);
  }

  const channel = member.voice.channel;
  let player = client.players.get(interaction.guildId);

  try {
    const connection = await connectToChannel(channel);
    const guild = await GuildService.getGuild(interaction.guildId);

    if (!player) {
      player = createPlayer(interaction.guildId);
      client.players.set(interaction.guildId, player);

      await playSong(player, song, guild.volume);
    } else {
      if (url) {
        await playSong(player, song, guild.volume);
      } else {
        const state = player.state.status;
        if (state !== AudioPlayerStatus.Idle) {
          return await reply(interaction, "Player is already playing");
        } else {
          player.emit("idle");
        }
      }
    }
    connection.subscribe(player);

    return await reply(interaction, {
      content: "",
      embeds: [songInfoEmbed(song)],
    });
  } catch (error) {
    console.error(error);
    return await reply(interaction, "Failed to play song");
  }
};
