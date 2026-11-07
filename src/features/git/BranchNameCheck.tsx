import { ArrowRight, Check, X } from "lucide-react";
import { useState } from "react";
import { project } from "@/project.config";

const examples = [
  { value: "feature/login-page", ok: true },
  { value: "fix/score-upload-crash", ok: true },
  { value: "release/1.2.0", ok: true },
  { value: "hotfix/jwt-expiry-null-check", ok: true },
  { value: "Feature/Login Page", ok: false },
  { value: "feature/หน้าล็อกอิน", ok: false },
  { value: "release/v1.2", ok: false },
];

const THAI = /[฀-๿]/;

/** Where a branch starts and where its PR goes, by prefix. */
function route(prefix: string) {
  if (prefix === "hotfix") return { from: project.branches.production, to: project.branches.production, then: true };
  if (prefix === "release") return { from: project.branches.integration, to: project.branches.production, then: true };
  return { from: project.branches.integration, to: project.branches.integration, then: false };
}

export function BranchNameCheck() {
  const [name, setName] = useState("feature/login-page");

  const slash = name.indexOf("/");
  const prefix = slash > 0 ? name.slice(0, slash) : "";
  const rest = slash > 0 ? name.slice(slash + 1) : "";
  const prefixes = project.branches.prefixes.map((p) => p.replace("/", ""));
  const prefixOk = prefixes.includes(prefix);
  const isRelease = prefix === "release";

  const checks = [
    { ok: prefixOk, label: `ขึ้นต้นด้วยประเภทงาน: ${project.branches.prefixes.join(" ")}` },
    { ok: name.length > 0 && !/\s/.test(name), label: "ไม่มีช่องว่าง" },
    { ok: !THAI.test(name), label: "ไม่มีภาษาไทย" },
    { ok: name === name.toLowerCase(), label: "ตัวพิมพ์เล็กทั้งหมด" },
    isRelease
      ? { ok: /^\d+\.\d+\.\d+$/.test(rest), label: "release ใช้เลขเวอร์ชัน x.y.z เช่น 1.2.0 (ไม่ใส่ v นำหน้า)" }
      : { ok: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(rest), label: "ส่วนหลัง / คั่นคำด้วย - เท่านั้น เช่น login-page" },
  ];
  const allOk = checks.every((c) => c.ok);
  const r = prefixOk ? route(prefix) : null;

  return (
    <div data-wide className="card card--flat flex flex-col gap-4">
      <div>
        <label htmlFor="branch-name" className="card-meta block">
          พิมพ์ชื่อ branch ที่อยากตั้ง
        </label>
        <input
          id="branch-name"
          className={["input w-full", allOk ? "input--success" : ""].join(" ")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {examples.map((ex) => (
            <button
              key={ex.value}
              type="button"
              onClick={() => setName(ex.value)}
              className="tag"
              title={ex.ok ? "ตัวอย่างที่ถูก" : "ตัวอย่างที่ผิด"}
            >
              <span aria-hidden>{ex.ok ? "✓" : "✗"}</span> {ex.value}
            </button>
          ))}
        </div>
      </div>

      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2 text-body-sm">
            {c.ok ? (
              <Check size={16} className="mt-0.5 shrink-0 text-ok" aria-label="ผ่าน" />
            ) : (
              <X size={16} className="mt-0.5 shrink-0 text-bad" aria-label="ไม่ผ่าน" />
            )}
            <span className={c.ok ? "text-ink2" : "text-ink"}>{c.label}</span>
          </li>
        ))}
      </ul>

      {r && (
        <div className="flex flex-wrap items-center gap-2 rounded-sm bg-wash px-4 py-3 text-body-sm">
          <span>แตกจาก</span>
          <code>{r.from}</code>
          <ArrowRight size={14} aria-hidden />
          <span>เปิด PR เข้า</span>
          <code>{r.to}</code>
          {r.then && (
            <span className="text-ink2">
              · แล้วต้องส่งกลับ <code>{project.branches.integration}</code> ผ่าน PR อีกใบ
            </span>
          )}
        </div>
      )}
    </div>
  );
}
