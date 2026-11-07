import { ArrowRight, Ban, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { useExplainMode } from "@/lib/explainMode";
import { layers } from "./layers.data";

/** Walks one request through Route → Controller → Service → Repository → DB. */
export function LayerExplorer() {
  const [index, setIndex] = useState(0);
  const { mode } = useExplainMode();
  const layer = layers[index]!;
  const last = layers.length - 1;

  return (
    <div data-wide className="flex flex-col gap-4">
      <p className="text-body-sm text-ink2">
        ตามคำขอ <code>GET /courses/c1/clos</code> ไปทีละชั้น กดที่ชั้น หรือกด "ถัดไป"
      </p>

      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0" aria-label="ชั้นของโค้ด">
        {layers.map((l, i) => (
          <li key={l.id} className="mt-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
              className={[
                "rounded-md border px-4 py-2 text-body font-semibold transition-colors",
                i === index
                  ? "border-ink bg-ink text-card"
                  : i < index
                    ? "border-edge bg-sel-bg text-sel"
                    : "border-edge bg-card text-ink2 hover:border-dim",
              ].join(" ")}
            >
              {l.title}
            </button>
            {i < last && <ArrowRight size={16} className="text-dim" aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="card card--flat" aria-live="polite">
        <p className="card-meta">
          ชั้นที่ {index + 1} จาก {layers.length} · <span className="font-mono normal-case tracking-normal">{layer.file}</span>
        </p>
        <p className="card-title">{layer.title}</p>
        <p className="text-body text-ink">{layer.analogy}</p>
        <p className="mt-2 text-body-sm text-ink2">
          <strong className="text-ink">ในคำขอนี้: </strong>
          {layer.journey}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-ok-bar bg-ok-bg p-4">
            <p className="mb-2 flex items-center gap-2 text-label font-semibold text-ok">
              <Check size={14} aria-hidden /> ทำได้
            </p>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-body-sm text-ink2">
              {layer.does.map((d) => (
                <li key={d} className="mt-0">
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-bad-bar bg-bad-bg p-4">
            <p className="mb-2 flex items-center gap-2 text-label font-semibold text-bad">
              <Ban size={14} aria-hidden /> ห้ามทำ
            </p>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-body-sm text-ink2">
              {layer.never.map((d) => (
                <li key={d} className="mt-0">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {mode === "detail" && (
          <div className="mt-4">
            <p className="card-meta">ตัวอย่างโค้ด</p>
            <CodeBlock code={layer.sample} />
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2">
        <button
          type="button"
          className="btn btn--outlined btn--sm"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ChevronLeft size={16} /> ก่อนหน้า
        </button>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setIndex((i) => Math.min(last, i + 1))}
          disabled={index === last}
        >
          ถัดไป <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
