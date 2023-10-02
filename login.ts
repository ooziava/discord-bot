import consola from "consola";
import { setToken } from "play-dl";

export default async (): Promise<void> => {
  try {
    await setToken({
      soundcloud: {
        client_id: process.env.SOUNDCLOUD_CLIENT_ID!,
      },
      spotify: {
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
        market: process.env.SPOTIFY_MARKET!,
      },
    });
    consola.success("Token set!");
  } catch (error) {
    consola.error(error);
  }
};

// authorization();
