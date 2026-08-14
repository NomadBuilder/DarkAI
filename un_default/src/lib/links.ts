/** Public product links */
export const LIVE_APP_URL = "https://darkai.ca/un-default";
/** Repo path is still `anti-default` until the GitHub rename lands. */
export const GITHUB_URL = "https://github.com/NomadBuilder/anti-default";
export const GITHUB_ACTION_URL =
  "https://github.com/NomadBuilder/anti-default/blob/main/action.yml";
export const CLI_DOCS_URL =
  "https://github.com/NomadBuilder/anti-default#add-it-in-under-a-minute";
/** Claude / Cursor growth one-pager */
export const AGENTS_DOCS_URL = `${LIVE_APP_URL}/for-agents`;

/**
 * Chrome Web Store listing. The store slug still contains the former brand
 * until the listing title is updated; the extension id is stable.
 */
export const CHROME_STORE_URL =
  process.env.NEXT_PUBLIC_CHROME_STORE_URL?.trim() ||
  "https://chromewebstore.google.com/detail/anti-default-%E2%80%94-inclusive/aajdplalleopollfjegljkajkdcihmhc";
