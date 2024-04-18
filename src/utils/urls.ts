import { SourceEnum, type Source } from "../types/source.js";

export function getPlaylistUrl(input: string, source: Source) {
  let playlistRegex;
  switch (source) {
    case SourceEnum.Spotify:
      playlistRegex = /open\.spotify\.com\/playlist\/([a-zA-Z0-9]{22})/;
      break;
    case SourceEnum.Youtube:
    default:
      playlistRegex =
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]{34})/;
  }
  const match = input.match(playlistRegex);
  const url = `https://${match?.[0]}`;
  if (match?.[0]) return url;
}

export function getSongUrl(input: string, source: Source) {
  let songRegex;
  switch (source) {
    case SourceEnum.Spotify:
      songRegex = /open\.spotify\.com\/track\/([a-zA-Z0-9]{22})/;
      break;
    case SourceEnum.Youtube:
    default:
      songRegex =
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  }
  const match = input.match(songRegex);
  const url = `https://${match?.[0]}`;
  if (match?.[0]) return url;
}

export function isURL(str: string) {
  const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]*$/;
  return urlRegex.test(str);
}
