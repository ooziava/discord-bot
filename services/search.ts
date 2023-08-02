import { validate, is_expired, refreshToken } from "play-dl";
import findYTVideo from "./socials/youtube.js";
import findSOVideo from "./socials/soundcolud.js";
import findSPVideo from "./socials/spotify.js";
import { Song } from "interfaces/discordjs.js";

export const search = async (query: string): Promise<Song[]> => {
  if (is_expired()) {
    await refreshToken();
  }
  // Validate the search query
  const info = await validate(query);
  if (!info) throw new Error("No video found!");

  const [social] = info.split("_");
  switch (social) {
    case "yt":
      return await findYTVideo(query, info);
    case "search":
      return await findYTVideo(query, info);
    case "so":
      return await findSOVideo(query);
    case "sp":
      return await findSPVideo(query);
    default:
      throw new Error("No video found!");
  }
};
