import { useEffect, useState, type RefObject } from "react";

interface TocItem {
  id: string;
  text: string;
}

/**
 * "On this page": the h2 headings of the current page, with the one being read highlighted.
 * Pages load lazily and some render headings after their data, so the list is rebuilt
 * whenever the content subtree changes, and only re-rendered when the headings differ.
 */
export function PageToc({ rootRef, path }: { rootRef: RefObject<HTMLElement | null>; path: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const collect = () => {
      const headings = [...root.querySelectorAll("h2")];
      headings.forEach((h, i) => {
        if (!h.id) h.id = `section-${i + 1}`;
      });
      const next = headings.map((h) => ({ id: h.id, text: h.textContent?.trim() ?? "" }));
      setItems((prev) =>
        prev.length === next.length && prev.every((p, i) => p.id === next[i]!.id && p.text === next[i]!.text)
          ? prev
          : next,
      );
    };

    collect();
    const observer = new MutationObserver(collect);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [rootRef, path]);

  // Highlight the heading nearest the top of the screen.
  useEffect(() => {
    if (items.length === 0) return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const first = items.find((it) => visible.get(it.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-72px 0px -65% 0px" },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="ในหน้านี้" className="flex flex-col gap-2">
      <p className="px-3 text-overline font-semibold uppercase tracking-[0.16em] text-ink2">ในหน้านี้</p>
      <ul className="m-0 flex list-none flex-col border-l border-edge p-0">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(it.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActive(it.id);
                }}
                aria-current={on ? "location" : undefined}
                className={[
                  "-ml-px block border-l-2 py-1.5 pl-3 pr-2 text-body-sm leading-snug no-underline transition-colors hover:no-underline",
                  on ? "border-haze font-semibold text-ink" : "border-transparent text-ink2 hover:text-ink",
                ].join(" ")}
              >
                {it.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
