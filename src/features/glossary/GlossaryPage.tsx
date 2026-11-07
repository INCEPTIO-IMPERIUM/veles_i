import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { categoryLabels, glossary, type GlossaryCategory } from "@/content/glossary";
import { sectionById } from "@/content/sections";
import { useExplainMode } from "@/lib/explainMode";
import { MarkReadButton } from "@/components/MarkReadButton";

type Filter = GlossaryCategory | "all";
const filters: Filter[] = ["all", ...(Object.keys(categoryLabels) as GlossaryCategory[])];

export function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { mode } = useExplainMode();
  const { hash } = useLocation();

  // Arriving from search or a <Term> link: scroll to and highlight the entry.
  const target = hash.slice(1);
  useEffect(() => {
    if (!target) return;
    setQuery("");
    setFilter("all");
    // Wait one tick so the filter reset has rendered the entry.
    const t = window.setTimeout(
      () => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" }),
      50,
    );
    return () => window.clearTimeout(t);
  }, [target]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return glossary
      .filter((t) => filter === "all" || t.category === filter)
      .filter((t) => !q || [t.term, t.simple, t.detail ?? ""].join(" ").toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [query, filter]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1>คำศัพท์</h1>
        <p className="mt-2 max-w-[62ch] text-body-lg text-ink2">
          ศัพท์ที่จะเจอในหน้าอื่นๆ ทั้งหมด {glossary.length} คำ คำที่มีเส้นประใต้ในหน้าอื่น ชี้เมาส์เพื่อดูความหมายได้
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="input-wrapper relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink2"
            aria-hidden
          />
          <input
            className="input w-full pl-9"
            placeholder="ค้นหาคำ เช่น merge"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="ค้นหาคำศัพท์"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="หมวด">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={["btn btn--sm", filter === f ? "btn--primary" : "btn--outlined"].join(" ")}
            >
              {f === "all" ? "ทั้งหมด" : categoryLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-ink2">ไม่พบคำนี้ ลองพิมพ์ให้สั้นลง</p>
      ) : (
        <dl className="grid gap-3 md:grid-cols-2">
          {shown.map((t) => {
            const see = t.see ? sectionById(t.see) : undefined;
            return (
              <div
                key={t.id}
                id={t.id}
                className={[
                  "card card--flat scroll-mt-24",
                  target === t.id ? "border-haze! ring-2 ring-haze" : "",
                ].join(" ")}
              >
                <dt className="flex flex-wrap items-center gap-2">
                  <span className="card-title mb-0">{t.term}</span>
                  <span className="badge badge--neutral">{categoryLabels[t.category]}</span>
                </dt>
                <dd className="mt-2 text-body text-ink">{t.simple}</dd>
                {mode === "detail" && t.detail && (
                  <dd className="mt-2 border-l-2 border-edge pl-3 text-body-sm text-ink2">
                    {t.detail}
                  </dd>
                )}
                {see && (
                  <dd className="mt-3 text-body-sm">
                    อ่านต่อ: <Link to={see.path}>{see.title}</Link>
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      )}

      {mode === "simple" && (
        <p className="text-body-sm text-ink2">
          อยากเห็นความหมายเชิงเทคนิคด้วย กดสลับเป็น "แบบละเอียด" ที่แถบด้านบน
        </p>
      )}

      <MarkReadButton id="glossary" />
    </div>
  );
}
