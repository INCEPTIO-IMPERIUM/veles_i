import { Check, Circle, X } from "lucide-react";
import { useState } from "react";
import { useExplainMode } from "@/lib/explainMode";

type Caller = "none" | "a" | "b" | "admin";
type CourseId = "c1" | "c2" | "ghost";
type Cap = "course.view" | "clo.write" | "course.delete";

const callers: { id: Caller; label: string }[] = [
  { id: "none", label: "ไม่มี token" },
  { id: "a", label: "อาจารย์ A (สอนวิชา 1)" },
  { id: "b", label: "อาจารย์ B (สอนวิชา 2)" },
  { id: "admin", label: "ADMIN" },
];

const courses: { id: CourseId; label: string }[] = [
  { id: "c1", label: "รายวิชา 1" },
  { id: "c2", label: "รายวิชา 2" },
  { id: "ghost", label: "รหัสที่ไม่มีอยู่จริง" },
];

/** Mirrors authorization/capabilities.ts: who may do what. */
const caps: { id: Cap; label: string; roles: ("ADMIN" | "INSTRUCTOR")[]; note: string }[] = [
  { id: "course.view", label: "ดูรายวิชา", roles: ["ADMIN", "INSTRUCTOR"], note: "อ่านข้อมูลของรายวิชา" },
  { id: "clo.write", label: "แก้ CLO", roles: ["INSTRUCTOR"], note: "งานสอน: ADMIN ไม่ได้ทำ (D-1)" },
  { id: "course.delete", label: "ลบรายวิชา", roles: ["ADMIN", "INSTRUCTOR"], note: "งานดูแลรายวิชา" },
];

type StepState = "pass" | "stop" | "skip";

function evaluate(caller: Caller, course: CourseId, cap: Cap) {
  const capRule = caps.find((c) => c.id === cap)!;
  const role = caller === "admin" ? "ADMIN" : caller === "none" ? null : "INSTRUCTOR";
  const sees =
    caller === "admin"
      ? course !== "ghost"
      : (caller === "a" && course === "c1") || (caller === "b" && course === "c2");

  const steps: { title: string; state: StepState; note: string }[] = [
    { title: "มี token ที่ถูกต้องไหม (authMiddleware)", state: "pass", note: "" },
    { title: "เห็นรายวิชานี้ไหม (authorize: ขอบเขตรายวิชา)", state: "skip", note: "" },
    { title: "role มีสิทธิ์ทำสิ่งนี้ไหม (capability)", state: "skip", note: "" },
  ];

  if (role === null) {
    steps[0] = { ...steps[0]!, state: "stop", note: "ไม่มี token" };
    return { status: 401, ok: false, steps, why: "ยังไม่รู้ว่าเป็นใคร จึงตอบ 401 ตั้งแต่ด่านแรก" };
  }
  if (!sees) {
    steps[1] = { ...steps[1]!, state: "stop", note: "มองไม่เห็น" };
    return {
      status: 404,
      ok: false,
      steps,
      why: "ตอบ 404 เหมือนกันทั้งกรณีไม่มีรายวิชา และกรณีมีแต่คุณไม่ควรเห็น ถ้าตอบ 403 ผู้ใช้จะรู้ว่ารหัสนี้มีอยู่จริง ซึ่งเป็นการเปิดช่องให้เดารหัสรายวิชาของคนอื่น",
    };
  }
  steps[1] = { ...steps[1]!, state: "pass", note: "" };
  if (!capRule.roles.includes(role)) {
    steps[2] = { ...steps[2]!, state: "stop", note: `${role} ทำ "${capRule.label}" ไม่ได้` };
    return {
      status: 403,
      ok: false,
      steps,
      why: "เห็นรายวิชานั้นอยู่แล้ว จึงบอกตรงๆ ได้ว่าสิทธิ์ไม่พอ ไม่มีอะไรให้ปิดบัง",
    };
  }
  steps[2] = { ...steps[2]!, state: "pass", note: "" };
  return { status: 200, ok: true, steps, why: "ผ่านทั้งสามด่าน" };
}

function ButtonGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="card-meta">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={o.id === value}
            onClick={() => onChange(o.id)}
            className={["btn btn--sm", o.id === value ? "btn--primary" : "btn--outlined"].join(" ")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Three gates a request passes. Pick who calls what, and see which gate stops it. */
export function AuthzDemo() {
  const [caller, setCaller] = useState<Caller>("a");
  const [course, setCourse] = useState<CourseId>("c2");
  const [cap, setCap] = useState<Cap>("clo.write");
  const { mode } = useExplainMode();

  const r = evaluate(caller, course, cap);
  const capRule = caps.find((c) => c.id === cap)!;

  return (
    <div data-wide className="flex flex-col gap-4">
      <div className="card card--flat flex flex-col gap-4">
        <ButtonGroup label="ใครเรียก" value={caller} options={callers} onChange={setCaller} />
        <ButtonGroup label="รายวิชาไหน" value={course} options={courses} onChange={setCourse} />
        <ButtonGroup
          label="ต้องการทำอะไร"
          value={cap}
          options={caps.map((c) => ({ id: c.id, label: c.label }))}
          onChange={setCap}
        />
      </div>

      <div className="card card--flat" aria-live="polite">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={[
              "rounded-md px-3 py-1 font-mono text-h4 font-semibold",
              r.ok ? "bg-ok-bg text-ok" : r.status === 404 ? "bg-warn-bg text-warn" : "bg-bad-bg text-bad",
            ].join(" ")}
          >
            {r.status}
          </span>
          <p className="text-body font-semibold text-ink">{r.ok ? "ทำได้" : "ถูกปฏิเสธ"}</p>
        </div>

        <ol className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {r.steps.map((s, i) => (
            <li key={s.title} className="mt-0 flex items-start gap-3 text-body-sm">
              {s.state === "pass" && <Check size={16} className="mt-0.5 shrink-0 text-ok" aria-label="ผ่าน" />}
              {s.state === "stop" && <X size={16} className="mt-0.5 shrink-0 text-bad" aria-label="หยุดที่นี่" />}
              {s.state === "skip" && <Circle size={16} className="mt-0.5 shrink-0 text-dim" aria-label="ไม่ถึงด่านนี้" />}
              <span className={s.state === "skip" ? "text-ink2" : "text-ink"}>
                ด่าน {i + 1}: {s.title}
                {s.note && <span className="text-ink2"> · {s.note}</span>}
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-4 text-body-sm text-ink2">{r.why}</p>

        {mode === "detail" && (
          <p className="mt-3 border-t border-edge pt-3 font-mono text-caption text-ink2">
            {capRule.id} · roles: {capRule.roles.join(", ")} · {capRule.note}
          </p>
        )}
      </div>
    </div>
  );
}
