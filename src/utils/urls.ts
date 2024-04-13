import type { Source } from "../types/source.js";

export function getPlaylistUrl(input: string, source: Source) {
  let playlistRegex;
  switch (source) {
    case "youtube":
    default:
      playlistRegex =
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]{34})/;
  }
  const match = input.match(playlistRegex);
  const url = match?.[0];
  return url;
}

export function isURL(str: string) {
  const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]*$/;
  return urlRegex.test(str);
}
