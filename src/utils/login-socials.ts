import consola from "consola";
import { setToken } from "play-dl";

const scClientId = process.env.SOUNDCLOUD_CLIENT_ID;
const spClientId = process.env.SPOTIFY_CLIENT_ID;
const spClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const spRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
const spMarket = process.env.SPOTIFY_MARKET;
const ytCookie = process.env.YOUTUBE_COOKIE;

if (!scClientId || !spClientId || !spClientSecret || !spRefreshToken || !spMarket) {
  consola.error("Missing required environment variables.");
  process.exit(1);
}

(async () => {
  let options = {
    soundcloud: {
      client_id: scClientId,
    },
    spotify: {
      client_id: spClientId,
      client_secret: spClientSecret,
      refresh_token: spRefreshToken,
      market: spMarket,
    },
  };
  if (ytCookie)
    Object.assign(options, {
      youtube: {
        cookie: ytCookie,
      },
    });
  consola.info(Object.keys(options).join(", "));
  await setToken(options);
  consola.success("Successfully set social tokens.");
})();

// authorization();
