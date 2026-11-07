import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { project } from "@/project.config";
import { roles, sectionById, sections } from "@/content/sections";
import { useProgress } from "@/lib/progress";
import { readStored, writeStored } from "@/lib/storage";
import { useExplainMode } from "@/lib/explainMode";

export function StartPage() {
  const [roleId, setRoleId] = useState<string>(() => readStored("role") ?? roles[0]!.id);
  const role = roles.find((r) => r.id === roleId) ?? roles[0]!;
  const { isRead, reset } = useProgress();
  const { mode } = useExplainMode();

  const pickRole = (id: string) => {
    setRoleId(id);
    writeStored("role", id);
  };

  const pathSections = role.path.map((id) => sectionById(id)).filter((s) => s !== undefined);
  const done = pathSections.filter((s) => isRead(s.id)).length;
  const pct = Math.round((done / pathSections.length) * 100);
  const next = pathSections.find((s) => !isRead(s.id) && s.status === "ready");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p className="text-label font-semibold uppercase tracking-[0.16em] text-haze">
          คู่มือโปรเจกต์ {project.name}
        </p>
        <h1 className="mt-2">ทุกอย่างที่ต้องรู้ก่อนลงมือทำโปรเจกต์ ในที่เดียว</h1>
        <p className="mt-3 max-w-[62ch] text-body-lg text-ink2">
          {mode === "simple"
            ? "veles รวมเรื่องที่ทีมตกลงกันไว้ ทั้งเครื่องมือที่ใช้ วิธีส่งงาน และกติกาการเขียนโค้ด อธิบายแบบที่คนไม่ได้เขียนโค้ดก็อ่านเข้าใจ อยากเห็นรายละเอียดจริง กดสลับเป็น \"แบบละเอียด\" ด้านบนได้ตลอด"
            : `รวม tech stack, Git Flow, กฎ layer และ pipeline CI ของ ${project.name} ไว้ในที่เดียว ต้นฉบับอยู่ใน docs/markdown ของ repo เมื่อเอกสารขัดกับโค้ด ให้เชื่อโค้ด`}
        </p>
      </section>

      <section aria-labelledby="role-heading">
        <h2 id="role-heading">1. คุณคือใครในโปรเจกต์นี้</h2>
        <div role="radiogroup" aria-labelledby="role-heading" className="mt-4 grid gap-3 sm:grid-cols-3">
          {roles.map((r) => {
            const active = r.id === role.id;
            return (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => pickRole(r.id)}
                className={[
                  "card card--flat text-left",
                  active ? "border-haze! bg-sel-bg! ring-2 ring-haze" : "hover:border-dim",
                ].join(" ")}
              >
                <span className="card-title flex items-center gap-2">
                  {active && <Check size={18} aria-hidden />}
                  {r.title}
                </span>
                <span className="card-body block">{r.who}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="path-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="path-heading">2. อ่านตามลำดับนี้</h2>
          {done > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
              <RotateCcw size={14} /> เริ่มนับใหม่
            </button>
          )}
        </div>

        <div className="progress mt-4">
          <div className="progress-header">
            <span className="progress-label">อ่านแล้ว {done} จาก {pathSections.length} หัวข้อ</span>
            <span className="progress-value">{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill progress-fill--success" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <ol className="mt-5 flex flex-col gap-2">
          {pathSections.map((s, i) => {
            const read = isRead(s.id);
            const soon = s.status === "soon";
            return (
              <li key={s.id}>
                <Link
                  to={s.path}
                  className="flex items-center gap-4 rounded-md border border-edge bg-card px-4 py-3 text-ink no-underline transition-colors hover:border-dim hover:no-underline"
                >
                  <span
                    className={[
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-label font-semibold",
                      read ? "bg-ok-bar text-white" : "bg-field text-ink2",
                    ].join(" ")}
                  >
                    {read ? <Check size={16} aria-label="อ่านแล้ว" /> : i + 1}
                  </span>
                  <s.icon size={20} strokeWidth={1.75} className="shrink-0 text-ink2" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      {s.title}
                      {soon && <span className="badge badge--warning">เร็วๆ นี้</span>}
                      {next?.id === s.id && <span className="badge badge--info">อ่านต่อตรงนี้</span>}
                    </span>
                    <span className="block text-body-sm text-ink2">{s.summary}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-ink2" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="all-heading">
        <h2 id="all-heading">หัวข้อทั้งหมด</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sections
            .filter((s) => s.id !== "start")
            .map((s) => (
              <Link key={s.id} to={s.path} className="card text-ink no-underline hover:no-underline">
                <s.icon size={22} strokeWidth={1.75} className="mb-3 text-haze" aria-hidden />
                <span className="card-title block">{s.title}</span>
                <span className="card-body block">{s.summary}</span>
                {s.status === "soon" && <span className="badge badge--warning mt-3">เร็วๆ นี้</span>}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
