import { Check, Copy } from "lucide-react";
import { isValidElement, useRef, useState, type ReactNode } from "react";

/** Copy-to-clipboard button. Clipboard can be blocked (http, iframes), so failure is silent. */
export function CopyButton({ text, label = "คัดลอก" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable: nothing to do */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="btn btn--ghost btn--sm absolute right-2 top-2 bg-card/80 backdrop-blur"
      aria-label={copied ? "คัดลอกแล้ว" : `${label}: ${text.split("\n")[0]}`}
    >
      {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
      {copied ? "คัดลอกแล้ว" : label}
    </button>
  );
}

/** Standalone command block with a copy button. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="m-0 overflow-x-auto rounded-sm border border-edge bg-wash p-4 pr-28 text-code leading-relaxed">
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/** Replaces <pre> in MDX so every fenced code block gets a copy button. */
export function Pre({ children }: { children?: ReactNode }) {
  const text = textOf(children).replace(/\n$/, "");
  return (
    <div className="relative">
      <pre>{children}</pre>
      <CopyButton text={text} />
    </div>
  );
}
