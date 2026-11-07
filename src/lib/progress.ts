import { useCallback, useSyncExternalStore } from "react";
import { readJson, writeStored } from "./storage";

/** Which section ids the reader has marked as read. Per browser only. */
const KEY = "read";
const listeners = new Set<() => void>();
let cache: readonly string[] = readJson<string[]>(KEY, []);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setRead(next: readonly string[]) {
  cache = next;
  writeStored(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useProgress() {
  const read = useSyncExternalStore(subscribe, () => cache);

  const isRead = useCallback((id: string) => read.includes(id), [read]);
  const toggleRead = useCallback(
    (id: string) => setRead(read.includes(id) ? read.filter((x) => x !== id) : [...read, id]),
    [read],
  );
  const reset = useCallback(() => setRead([]), []);

  return { read, isRead, toggleRead, reset };
}
