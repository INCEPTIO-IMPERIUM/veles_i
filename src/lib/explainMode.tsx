import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { readStored, writeStored } from "./storage";

/**
 * "ง่าย / ละเอียด" switch. Pages write both versions; the reader picks one.
 *   simple → analogies, no commands, for non-developers
 *   detail → the real rules, commands and file paths
 */
export type ExplainMode = "simple" | "detail";

interface ExplainModeValue {
  mode: ExplainMode;
  setMode: (mode: ExplainMode) => void;
}

const ExplainModeContext = createContext<ExplainModeValue | null>(null);

export function ExplainModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ExplainMode>(() =>
    readStored("explain") === "detail" ? "detail" : "simple",
  );

  const setMode = useCallback((next: ExplainMode) => {
    writeStored("explain", next);
    setModeState(next);
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ExplainModeContext.Provider value={value}>{children}</ExplainModeContext.Provider>;
}

export function useExplainMode(): ExplainModeValue {
  const value = useContext(ExplainModeContext);
  if (!value) throw new Error("useExplainMode must be used inside <ExplainModeProvider>");
  return value;
}
