import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { termById } from "@/content/glossary";

/**
 * Inline glossary tooltip. In MDX: <Term id="branch">branch</Term>
 * Shows on hover and on keyboard focus; clicking opens the glossary entry.
 */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const term = termById(id);
  const [open, setOpen] = useState(false);
  const tipId = useId();

  if (!term) {
    if (import.meta.env.DEV) console.warn(`<Term id="${id}"> has no glossary entry`);
    return <>{children}</>;
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to={`/glossary#${term.id}`}
        aria-describedby={tipId}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="border-b border-dashed border-haze text-inherit no-underline hover:no-underline"
      >
        {children ?? term.term}
      </Link>
      <span
        id={tipId}
        role="tooltip"
        className={[
          "absolute bottom-full left-1/2 z-[600] mb-2 w-64 -translate-x-1/2 rounded-sm bg-ink px-3 py-2 text-body-sm leading-snug text-card shadow-pop transition-opacity",
          open ? "visible opacity-100" : "invisible opacity-0",
        ].join(" ")}
      >
        <strong className="block">{term.term}</strong>
        {term.simple}
      </span>
    </span>
  );
}
