/**
 * localStorage wrapper. Storage can be missing or throw (private window,
 * blocked site data), so every access is guarded and falls back silently.
 * Only per-reader conveniences live here: theme, explain mode, reading progress.
 */
const PREFIX = "veles:";

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    /* storage unavailable: the setting just won't persist */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readStored(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
