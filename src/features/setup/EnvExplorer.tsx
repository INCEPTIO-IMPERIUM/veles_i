import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useExplainMode } from "@/lib/explainMode";
import { envVars, fileLabels, type EnvFile } from "./env.data";

type Filter = EnvFile | "all";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "server", label: fileLabels.server },
  { id: "client", label: fileLabels.client },
  { id: "database", label: fileLabels.database },
];

/** Every environment variable: what it is, where it lives, and whether it is a secret. */
export function EnvExplorer() {
  const [filter, setFilter] = useState<Filter>("all");
  const [secretOnly, setSecretOnly] = useState(false);
  const { mode } = useExplainMode();

  const shown = envVars
    .filter((v) => filter === "all" || v.files.includes(filter))
    .filter((v) => !secretOnly || v.secret);

  return (
    <div data-wide className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="ไฟล์" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={["btn btn--sm", filter === f.id ? "btn--primary" : "btn--outlined"].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-edge bg-card px-3 py-1.5 text-body-sm">
          <input
            type="checkbox"
            checked={secretOnly}
            onChange={(e) => setSecretOnly(e.target.checked)}
            className="size-4 accent-[var(--color-haze)]"
          />
          เฉพาะที่เป็นความลับ
        </label>
        <span className="text-body-sm text-ink2">
          {shown.length} จาก {envVars.length} ตัว
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {shown.map((v) => (
          <div key={v.name} className="card card--flat">
            <div className="flex flex-wrap items-center gap-2">
              <p className="card-title mb-0 font-mono">{v.name}</p>
              {v.secret ? (
                <span className="badge badge--danger">
                  <KeyRound size={12} aria-hidden /> ความลับ
                </span>
              ) : (
                <span className="badge badge--neutral">ไม่ลับ</span>
              )}
            </div>
            <p className="mt-1 text-caption text-ink2">{v.files.map((f) => fileLabels[f]).join(" · ")}</p>
            <p className="mt-2 text-body-sm text-ink">{v.simple}</p>
            {v.note && <p className="mt-2 text-body-sm text-ink2">{v.note}</p>}
            {mode === "detail" && (
              <p className="mt-2 break-all rounded-sm bg-wash px-2 py-1 font-mono text-caption text-ink2">
                {v.name}="{v.example}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
