import { useCallback, useState } from "react";
import { writeStored } from "./storage";

export type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** index.html sets the initial theme before paint; this hook only toggles it. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    writeStored("theme", next);
    setTheme(next);
  }, []);

  return { theme, toggle };
}
