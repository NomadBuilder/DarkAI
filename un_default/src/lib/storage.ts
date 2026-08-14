/**
 * Migrate browser storage keys from the former Anti-Default brand.
 * Reads the new key first; if missing, copies from the legacy key once.
 */
export function readMigratedStorage(key: string, legacyKey: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const current = localStorage.getItem(key);
    if (current != null) return current;
    const legacy = localStorage.getItem(legacyKey);
    if (legacy == null) return null;
    localStorage.setItem(key, legacy);
    return legacy;
  } catch {
    return null;
  }
}
