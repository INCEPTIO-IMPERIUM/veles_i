import { ArrowDown, Check, Minus, RotateCcw, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { useExplainMode } from "@/lib/explainMode";
import { changesJob, gateJob, groupLabels, jobs, type CiJob, type JobGroup } from "./ciJobs.data";

type Status = "pass" | "fail" | "skipped";

const groupOrder: JobGroup[] = ["code", "real", "security", "rule"];

const statusStyle: Record<Status, string> = {
  pass: "border-ok-bar bg-ok-bg",
  fail: "border-bad-bar bg-bad-bg",
  skipped: "border-dashed border-edge bg-nil-bg opacity-75",
};

const statusText: Record<Status, string> = { pass: "ผ่าน", fail: "ล้ม", skipped: "ข้าม" };

function StatusIcon({ status }: { status: Status }) {
  if (status === "pass") return <Check size={16} className="text-ok" aria-hidden />;
  if (status === "fail") return <X size={16} className="text-bad" aria-hidden />;
  return <Minus size={16} className="text-ink2" aria-hidden />;
}

function Chip({
  job,
  status,
  selected,
  onSelect,
}: {
  job: CiJob;
  status: Status;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors",
        statusStyle[status],
        selected ? "ring-2 ring-haze" : "hover:border-dim",
      ].join(" ")}
    >
      <StatusIcon status={status} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-label font-semibold text-ink">{job.id}</span>
        <span className="block truncate text-caption text-ink2">{job.label}</span>
      </span>
      <span className="sr-only">{statusText[status]}</span>
    </button>
  );
}

function Stage({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="card-meta">
        {n} · {title}
      </p>
      {children}
    </div>
  );
}

export function PipelineExplorer() {
  const [selectedId, setSelectedId] = useState("static");
  const [failed, setFailed] = useState<string[]>([]);
  const [docsOnly, setDocsOnly] = useState(false);
  const { mode } = useExplainMode();

  const statusOf = (job: CiJob): Status => {
    if (docsOnly && job.needsApp) return "skipped";
    return failed.includes(job.id) ? "fail" : "pass";
  };

  const gateStatus: Status = jobs.some((j) => statusOf(j) === "fail") ? "fail" : "pass";
  const all = [changesJob, ...jobs, gateJob];
  const selected = all.find((j) => j.id === selectedId) ?? jobs[0]!;
  const isGate = selected.id === gateJob.id;
  const selectedStatus = isGate ? gateStatus : statusOf(selected);
  const failedNames = jobs.filter((j) => statusOf(j) === "fail").map((j) => j.id);

  const toggleFail = (id: string) =>
    setFailed((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <div data-wide className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-edge bg-card px-3 py-2 text-body-sm">
          <input
            type="checkbox"
            checked={docsOnly}
            onChange={(e) => setDocsOnly(e.target.checked)}
            className="size-4 accent-[var(--color-haze)]"
          />
          สมมติว่า PR นี้แก้แค่เอกสาร (docs/ หรือ .md)
        </label>
        {(failed.length > 0 || docsOnly) && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setFailed([]);
              setDocsOnly(false);
            }}
          >
            <RotateCcw size={14} /> รีเซ็ต
          </button>
        )}
        <span className="text-body-sm text-ink2">กดที่ job เพื่ออ่านว่าตรวจอะไร</span>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-edge bg-wash p-4">
        <Stage n={1} title="PR ถูกเปิด หรือมีการ push">
          <div className="max-w-sm">
            <Chip
              job={changesJob}
              status="pass"
              selected={selectedId === changesJob.id}
              onSelect={() => setSelectedId(changesJob.id)}
            />
          </div>
        </Stage>

        <ArrowDown size={18} className="mx-auto text-dim" aria-hidden />

        <Stage n={2} title="ทุก job เริ่มพร้อมกัน">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groupOrder.map((g) => (
              <div key={g} className="flex flex-col gap-2">
                <p className="text-label font-semibold text-ink">
                  {groupLabels[g].title}
                  <span className="ml-2 font-normal text-ink2">{groupLabels[g].hint}</span>
                </p>
                {jobs
                  .filter((j) => j.group === g)
                  .map((j) => (
                    <Chip
                      key={j.id}
                      job={j}
                      status={statusOf(j)}
                      selected={selectedId === j.id}
                      onSelect={() => setSelectedId(j.id)}
                    />
                  ))}
              </div>
            ))}
          </div>
        </Stage>

        <ArrowDown size={18} className="mx-auto text-dim" aria-hidden />

        <Stage n={3} title="ด่านสุดท้าย">
          <button
            type="button"
            onClick={() => setSelectedId(gateJob.id)}
            aria-pressed={isGate}
            className={[
              "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors",
              statusStyle[gateStatus],
              isGate ? "ring-2 ring-haze" : "hover:border-dim",
            ].join(" ")}
          >
            <StatusIcon status={gateStatus} />
            <span className="flex-1">
              <span className="block font-mono text-body font-semibold text-ink">CI gate</span>
              <span className="block text-body-sm text-ink2">
                {gateStatus === "pass"
                  ? "ผ่านทั้งหมด PR นี้ merge ได้ (ถ้ามี approval ครบ)"
                  : `ล้ม: ${failedNames.join(", ")} · PR นี้ merge ไม่ได้ จนกว่าจะแก้`}
              </span>
            </span>
          </button>
        </Stage>
      </div>

      <div className="card card--flat" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <p className="card-title mb-0 font-mono">{selected.id}</p>
          <span className={`badge ${selectedStatus === "fail" ? "badge--danger" : selectedStatus === "skipped" ? "badge--neutral" : "badge--success"}`}>
            {statusText[selectedStatus]}
          </span>
          {selected.prOnly && <span className="badge badge--info">เฉพาะ PR</span>}
          {selected.needsApp && <span className="badge badge--neutral">ข้ามเมื่อแก้แค่ docs</span>}
        </div>
        <p className="mt-1 text-body-sm text-ink2">
          ชื่อที่เห็นบน PR: <strong className="text-ink">{selected.name}</strong> · รอได้สูงสุด {selected.minutes} นาที
        </p>

        <p className="mt-3 text-body text-ink">{selected.simple}</p>

        {mode === "detail" && (
          <div className="mt-3 flex flex-col gap-3 border-t border-edge pt-3">
            <p className="text-body-sm text-ink2">{selected.detail}</p>
            {selected.local && (
              <div>
                <p className="card-meta">รันซ้ำในเครื่อง</p>
                <CodeBlock code={selected.local} />
              </div>
            )}
          </div>
        )}

        <div className="alert alert--warning mt-4">
          <div>
            <p className="alert-title">ถ้า job นี้สีแดง</p>
            <p className="alert-body">{selected.onFail}</p>
          </div>
        </div>

        {!isGate && selected.id !== changesJob.id && (
          <button
            type="button"
            className="btn btn--outlined btn--sm mt-4"
            onClick={() => toggleFail(selected.id)}
            disabled={selectedStatus === "skipped"}
          >
            {failed.includes(selected.id) ? "ยกเลิกการสมมติ" : "สมมติว่า job นี้ล้ม แล้วดู CI gate"}
          </button>
        )}
      </div>
    </div>
  );
}
