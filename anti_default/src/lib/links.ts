/** Public product links */
export const LIVE_APP_URL = "https://darkai.ca/anti-default";
export const GITHUB_URL = "https://github.com/NomadBuilder/anti-default";
export const GITHUB_ACTION_URL =
  "https://github.com/NomadBuilder/anti-default/blob/main/action.yml";

/** Chrome Web Store listing (override with NEXT_PUBLIC_CHROME_STORE_URL). */
export const CHROME_STORE_URL =
  process.env.NEXT_PUBLIC_CHROME_STORE_URL?.trim() ||
  "https://chromewebstore.google.com/detail/anti-default-%E2%80%94-inclusive/aajdplalleopollfjegljkajkdcihmhc";
