import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BookA, CornerDownLeft, Search } from "lucide-react";
import { sections } from "@/content/sections";
import { glossary } from "@/content/glossary";

interface Result {
  key: string;
  title: string;
  summary: string;
  kind: "page" | "term";
  to: string;
  soon?: boolean;
}

const index: (Result & { haystack: string })[] = [
  ...sections.map((s) => ({
    key: `page:${s.id}`,
    title: s.title,
    summary: s.summary,
    kind: "page" as const,
    to: s.path,
    soon: s.status === "soon",
    haystack: [s.title, s.summary, ...s.keywords].join(" ").toLowerCase(),
  })),
  ...glossary.map((t) => ({
    key: `term:${t.id}`,
    title: t.term,
    summary: t.simple,
    kind: "term" as const,
    to: `/glossary#${t.id}`,
    haystack: [t.term, t.simple, t.detail ?? ""].join(" ").toLowerCase(),
  })),
];

function search(query: string): Result[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.filter((r) => r.kind === "page");
  const words = q.split(/\s+/);
  return index
    .filter((r) => words.every((w) => r.haystack.includes(w)))
    .sort((a, b) => Number(b.title.toLowerCase().includes(q)) - Number(a.title.toLowerCase().includes(q)))
    .slice(0, 12);
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => search(query), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (r: Result | undefined) => {
    if (!r) return;
    onClose();
    navigate(r.to);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") go(results[active]);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-start justify-center p-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="ปิดการค้นหา" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ค้นหา"
        className="relative w-full max-w-xl overflow-hidden rounded-lg border border-edge bg-card shadow-pop"
      >
        <div className="flex items-center gap-3 border-b border-edge px-4">
          <Search size={18} className="text-ink2" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="พิมพ์ เช่น branch, migration, CI"
            className="h-14 flex-1 bg-transparent text-body-lg text-ink outline-none placeholder:text-ink2"
            aria-label="คำค้นหา"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
          />
          <span className="kbd">Esc</span>
        </div>

        <ul id="search-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-body text-ink2">
              ไม่พบ "{query}" ลองคำที่สั้นลง หรือดูในหน้าคำศัพท์
            </li>
          )}
          {results.map((r, i) => (
            <li key={r.key} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
                className={[
                  "flex w-full items-start gap-3 rounded-sm px-3 py-2.5 text-left",
                  i === active ? "bg-sel-bg" : "",
                ].join(" ")}
              >
                <span className="mt-0.5 text-ink2">
                  {r.kind === "term" ? <BookA size={16} /> : <Search size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-body font-semibold text-ink">
                    {r.title}
                    {r.kind === "term" && <span className="badge badge--neutral">คำศัพท์</span>}
                    {r.soon && <span className="badge badge--warning">เร็วๆ นี้</span>}
                  </span>
                  <span className="line-clamp-1 text-body-sm text-ink2">{r.summary}</span>
                </span>
                {i === active && <CornerDownLeft size={14} className="mt-1 text-ink2" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
