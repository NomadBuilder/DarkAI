/** Public product links — update CHROME_STORE_URL when the listing ID is final. */
export const LIVE_APP_URL = "https://darkai.ca/anti-default";
export const GITHUB_URL = "https://github.com/NomadBuilder/anti-default";
export const GITHUB_ACTION_URL =
  "https://github.com/NomadBuilder/anti-default/blob/main/action.yml";

/**
 * Chrome Web Store listing. Override with NEXT_PUBLIC_CHROME_STORE_URL at build time
 * once you have the permanent detail URL from the developer dashboard.
 */
export const CHROME_STORE_URL =
  process.env.NEXT_PUBLIC_CHROME_STORE_URL?.trim() ||
  "https://chromewebstore.google.com/search/Anti-Default%20Inclusive%20Language";
