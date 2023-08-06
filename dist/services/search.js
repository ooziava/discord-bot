import { validate, is_expired, refreshToken } from "play-dl";
import findYTVideo from "./socials/youtube.js";
import findSOVideo from "./socials/soundcolud.js";
import findSPVideo from "./socials/spotify.js";
export const search = async (query) => {
    if (is_expired()) {
        await refreshToken();
    }
    const info = await validate(query);
    if (!info)
        throw new Error("No video found!");
    const social = info.split("_")[0];
    switch (social) {
        case "yt":
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
