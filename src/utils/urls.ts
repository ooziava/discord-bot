import { validate } from "play-dl";
import { SourceEnum } from "../types/source.js";

const spPlaylistRegex = /spotify\.com\/playlist\/([a-zA-Z0-9]{22})/;
const ytPlaylistRegex =
  /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]{34})/;

const spSongRegex = /spotify\.com\/track\/([a-zA-Z0-9]{22})/;
const ytSongRegex =
  /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function getPlaylistUrl(input?: string) {
  if (!input) return;
  let url, match;

  match = input.match(spPlaylistRegex);
  url = `https://open.${match?.[0]}`;
  if (match?.[0]) return url;

  match = input.match(ytPlaylistRegex);
  url = `https://www.${match?.[0]}`;
  if (match?.[0]) return url;
}

export function getSongUrl(input?: string) {
  if (!input) return;
  let url, match;
  match = input.match(spSongRegex);
  if (match?.[0]) {
    url = `https://open.${match?.[0]}`;
    return url;
  }
  match = input.match(ytSongRegex);
  if (match?.[0]) {
    url = `https://www.${match?.[0]}`;
    return url;
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
