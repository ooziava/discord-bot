import { SlashCommandBuilder, Message, GuildMember } from "discord.js";
import { AudioPlayerStatus, VoiceConnectionStatus } from "@discordjs/voice";

import songInfoEmbed from "../../embeds/song-info.js";

import { GuildService, SearchService, SongService } from "../../services/index.js";
import { reply, connectToChannel, createPlayer, playSong } from "../../utils/index.js";

import { type Data, type Execute, SourceEnum } from "../../types/index.js";
import consola from "consola";

export const data: Data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song")
  .addStringOption((option) => option.setName("url").setDescription("The URL of the song to play"));

export const execute: Execute = async (client, interaction, args) => {
  const url = interaction instanceof Message ? args?.[0] : interaction.options.getString("url");

  const member = interaction.member;
  if (!(member instanceof GuildMember) || !member.voice.channel) {
    await reply(interaction, "You need to be in a voice channel to play a song");
    return;
  }

  let song;
  if (!url) {
    song = await GuildService.getCurrentSong(interaction.guildId);
    if (!song) {
      await reply(interaction, "No song in queue");
      return;
    }
    await reply(interaction, "Playing last song in queue");
  } else {
    if (interaction instanceof Message) await reply(interaction, "Searching for song...");
    else await interaction.deferReply();

    consola.info(`Searching for song: ${url}`);
    const video = await SearchService.getSongByURL(url);
    consola.info(`Found song: ${video?.title}`);
    if (!video) {
      await reply(interaction, "Song not found");
      return;
    }

    song = SongService.parseYoutubeVideo(video);
  }

  const channel = member.voice.channel;

  try {
    const connection = await connectToChannel(client, channel);
    let player = client.players.get(interaction.guildId);
    if (!player) {
      player = createPlayer(interaction.guildId);
      client.players.set(interaction.guildId, player);
    }
    connection.subscribe(player);
    const meta = await GuildService.getPlayerMeta(interaction.guildId);

    if (!url && player.state.status != AudioPlayerStatus.Idle) {
      await reply(interaction, "Player is already playing");
      return;
    }

    await playSong(player, song, meta.volume);
    await reply(interaction, {
      content: "",
      embeds: [songInfoEmbed(song)],
    });
  } catch (error) {
    console.error(error);
    await reply(interaction, "Failed to play song");
  }
};
