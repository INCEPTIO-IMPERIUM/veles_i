import { Pin } from "lucide-react";
import { useState } from "react";
import { useExplainMode } from "@/lib/explainMode";
import { layerInfo, techs, type StackLayer } from "./stack.data";

const layers = Object.keys(layerInfo) as StackLayer[];

/** The stack, one layer at a time. Click a tool to see what it does and why it is here. */
export function StackExplorer() {
  const [layer, setLayer] = useState<StackLayer>("client");
  const [selectedId, setSelectedId] = useState(techs.find((t) => t.layer === "client")!.id);
  const { mode } = useExplainMode();

  const inLayer = techs.filter((t) => t.layer === layer);
  const selected = techs.find((t) => t.id === selectedId && t.layer === layer) ?? inLayer[0]!;

  const pickLayer = (l: StackLayer) => {
    setLayer(l);
    setSelectedId(techs.find((t) => t.layer === l)!.id);
  };

  return (
    <div data-wide className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="ชั้น" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {layers.map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={l === layer}
            onClick={() => pickLayer(l)}
            className={[
              "rounded-md border px-3 py-2 text-left transition-colors",
              l === layer ? "border-haze bg-sel-bg ring-2 ring-haze" : "border-edge bg-card hover:border-dim",
            ].join(" ")}
          >
            <span className="block text-body font-semibold text-ink">{layerInfo[l].title}</span>
            <span className="block text-caption text-ink2">{layerInfo[l].analogy}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label={`เครื่องมือชั้น ${layerInfo[layer].title}`}>
          {inLayer.map((t) => (
            <li key={t.id} className="mt-0">
              <button
                type="button"
                onClick={() => setSelectedId(t.id)}
                aria-pressed={t.id === selected.id}
                className={[
                  "flex w-full items-center gap-2 rounded-sm border px-3 py-2 text-left transition-colors",
                  t.id === selected.id ? "border-haze bg-sel-bg" : "border-edge bg-card hover:border-dim",
                ].join(" ")}
              >
                <span className="min-w-0 flex-1 truncate text-body font-semibold text-ink">{t.name}</span>
                {t.decision && <Pin size={13} className="shrink-0 text-warn-bar" aria-label="มีเหตุผลที่ควรรู้" />}
                <span className="shrink-0 font-mono text-caption text-ink2">{t.version}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="card card--flat" aria-live="polite">
          <p className="card-meta">{layerInfo[layer].title}</p>
          <p className="card-title">
            {selected.name} <span className="ml-1 font-mono text-body-sm font-normal text-ink2">{selected.version}</span>
          </p>
          <p className="text-body text-ink">{selected.simple}</p>
          {mode === "detail" && <p className="mt-3 border-t border-edge pt-3 text-body-sm text-ink2">{selected.detail}</p>}
          {selected.decision && (
            <div className="alert alert--warning mt-4">
              <div>
                <p className="alert-title">เหตุผลที่ควรรู้</p>
                <p className="alert-body">{selected.decision}</p>
              </div>
            </div>
          )}
          {mode === "simple" && !selected.decision && (
            <p className="mt-3 text-body-sm text-ink2">รายละเอียดทางเทคนิค ดูได้ใน "แบบละเอียด"</p>
          )}
        </div>
      </div>
    </div>
  );
}
