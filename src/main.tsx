import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ExplainModeProvider } from "./lib/explainMode";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExplainModeProvider>
      <App />
    </ExplainModeProvider>
  </StrictMode>,
);
