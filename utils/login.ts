import consola from "consola";
import { setToken } from "play-dl";

const scClientId = process.env.SOUNDCLOUD_CLIENT_ID;
const spClientId = process.env.SPOTIFY_CLIENT_ID;
const spClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const spRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
const spMarket = process.env.SPOTIFY_MARKET;

if (!scClientId || !spClientId || !spClientSecret || !spRefreshToken || !spMarket)
  throw new Error("Missing environment variables");

export default async () => {
  await setToken({
    soundcloud: {
      client_id: scClientId,
    },
    spotify: {
      client_id: spClientId,
      client_secret: spClientSecret,
      refresh_token: spRefreshToken,
      market: spMarket,
    },
  });
  consola.success("Token set!");
};

// authorization();
