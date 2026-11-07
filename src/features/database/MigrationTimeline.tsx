import { AlertTriangle, PencilLine, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useExplainMode } from "@/lib/explainMode";
import { migrations } from "./migrations.data";

/**
 * The seven live migrations as a timeline, plus a one-click demonstration of why
 * `prisma db push` is banned: it silently drops everything written by hand.
 */
export function MigrationTimeline() {
  const [selectedId, setSelectedId] = useState(migrations[1]!.id);
  const [pushed, setPushed] = useState(false);
  const { mode } = useExplainMode();
  const selected = migrations.find((m) => m.id === selectedId)!;
  const lost = migrations.filter((m) => m.hand);

  return (
    <div data-wide className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={["btn btn--sm", pushed ? "btn--outlined" : "btn--primary"].join(" ")}
          onClick={() => setPushed((p) => !p)}
          aria-pressed={pushed}
        >
          {pushed ? (
            <>
              <RotateCcw size={14} /> ย้อนกลับ
            </>
          ) : (
            <>จำลอง: รัน prisma db push</>
          )}
        </button>
        <span className="flex items-center gap-1.5 text-body-sm text-ink2">
          <PencilLine size={14} aria-hidden /> = เขียนมือ (Prisma ไม่ได้สร้างให้)
        </span>
      </div>

      <ol className="m-0 flex list-none flex-col gap-2 p-0" aria-label="ประวัติ migration">
        {migrations.map((m) => {
          const wiped = pushed && m.hand;
          return (
            <li key={m.id} className="mt-0">
              <button
                type="button"
                onClick={() => setSelectedId(m.id)}
                aria-pressed={m.id === selectedId}
                className={[
                  "flex w-full items-center gap-3 rounded-md border px-4 py-2.5 text-left transition-colors",
                  wiped ? "border-bad-bar bg-bad-bg" : m.id === selectedId ? "border-haze bg-sel-bg" : "border-edge bg-card hover:border-dim",
                ].join(" ")}
              >
                <span className={["font-mono text-label font-semibold", wiped ? "text-ink2 line-through" : "text-ink"].join(" ")}>
                  {m.id.slice(0, 4)}
                </span>
                <span className={["min-w-0 flex-1 truncate text-body", wiped ? "text-ink2 line-through" : "text-ink"].join(" ")}>
                  {m.title}
                </span>
                {m.hand && <PencilLine size={14} className="shrink-0 text-ink2" aria-label="เขียนมือ" />}
                {wiped && <span className="badge badge--danger">หาย</span>}
                {m.date && !wiped && <span className="hidden text-caption text-ink2 sm:inline">{m.date}</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {pushed && (
        <div className="alert alert--danger" role="alert">
          <AlertTriangle size={18} className="alert-icon" aria-hidden />
          <div>
            <p className="alert-title">db push ลบทิ้งเงียบๆ {lost.length} migration</p>
            <p className="alert-body">
              ตัวกั้นและ trigger ที่เขียนมือไม่ได้อยู่ใน schema.prisma ดังนั้น db push ที่ปรับฐานข้อมูลให้ตรงกับ schema จะลบมันออก โดยไม่มีข้อความเตือน
              ข้อมูลที่ผิดกฎก็เข้าฐานข้อมูลได้ทันที ทีมจึงห้ามใช้ในทุกสภาพแวดล้อม รวมถึงในเครื่องตัวเอง
            </p>
          </div>
        </div>
      )}

      <div className="card card--flat" aria-live="polite">
        <p className="card-meta">
          {selected.date ?? "baseline"} · {selected.hand ? "เขียนมือ" : "Prisma สร้างให้"}
        </p>
        <p className="card-title font-mono">{selected.id}</p>
        <p className="text-body text-ink">{selected.simple}</p>
        {mode === "detail" && <p className="mt-3 border-t border-edge pt-3 text-body-sm text-ink2">{selected.detail}</p>}
      </div>
    </div>
  );
}
