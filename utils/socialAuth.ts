import { getFreeClientID, setToken } from "play-dl";
import dotenv from "dotenv";
dotenv.config();

export default async (): Promise<void> => {
  try {
    const clientID = await getFreeClientID();
    await setToken({
      soundcloud: {
        client_id: clientID,
      },
      spotify: {
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
        market: process.env.SPOTIFY_MARKET!,
      },
    });
    console.log("Token set!");
  } catch (error) {
    console.error(error);
  }
};
