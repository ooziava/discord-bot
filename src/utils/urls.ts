import { validate } from "play-dl";
import { SourceEnum, type Source } from "../types/source.js";

export function getPlaylistUrl(input: string, source?: Source) {
  let playlistRegex, url, match;
  switch (source) {
    case SourceEnum.Spotify:
      playlistRegex = /spotify\.com\/playlist\/([a-zA-Z0-9]{22})/;
      match = input.match(playlistRegex);
      url = `https://open.${match?.[0]}`;
      if (match?.[0]) return url;
      break;
    case SourceEnum.Youtube:
    default:
      playlistRegex =
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]{34})/;
      match = input.match(playlistRegex);
      url = `https://www.${match?.[0]}`;
      if (match?.[0]) return url;
  }
}

export function getSongUrl(input: string, source?: Source) {
  let songRegex, url, match;
  switch (source) {
    case SourceEnum.Spotify:
      songRegex = /spotify\.com\/track\/([a-zA-Z0-9]{22})/;
      match = input.match(songRegex);
      url = `https://open.${match?.[0]}`;
      if (match?.[0]) return url;
      break;
    case SourceEnum.Youtube:
    default:
      songRegex =
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      match = input.match(songRegex);
      url = `https://www.${match?.[0]}`;
      if (match?.[0]) return url;
  }
}

export function isURL(str: string) {
  const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]*$/;
  return urlRegex.test(str);
}

export async function getPlaylistSource(input: string) {
  const result = await validate(input).catch(() => null);
  switch (result) {
    case "yt_playlist":
      return SourceEnum.Youtube;
    case "sp_album":
    case "sp_playlist":
      return SourceEnum.Spotify;
  }
}

export async function getSongSource(input: string) {
  const result = await validate(input).catch(() => null);
  switch (result) {
    case "yt_video":
    case "yt_playlist":
      return SourceEnum.Youtube;
    case "sp_track":
      return SourceEnum.Spotify;
  }
}
