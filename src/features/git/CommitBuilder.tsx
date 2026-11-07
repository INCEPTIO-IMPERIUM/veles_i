import { Check, X } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { useExplainMode } from "@/lib/explainMode";

const types = [
  { id: "feat", use: "เพิ่มฟีเจอร์ใหม่", example: "เพิ่มระบบล็อกอินด้วยอีเมล" },
  { id: "fix", use: "แก้บั๊ก", example: "แก้บั๊กปุ่มบันทึกไม่ทำงานบนมือถือ" },
  { id: "docs", use: "แก้ไขเอกสาร", example: "อัปเดตขั้นตอนติดตั้งใน README" },
  { id: "refactor", use: "ปรับโครงสร้างโค้ด ไม่เปลี่ยนพฤติกรรม", example: "แยกฟังก์ชันคำนวณคะแนนออกจาก controller" },
  { id: "style", use: "แก้ formatting / เว้นวรรค ไม่กระทบ logic", example: "จัดรูปแบบไฟล์ด้วย prettier" },
  { id: "test", use: "เพิ่มหรือแก้ test", example: "เพิ่ม test การคำนวณเกรด" },
  { id: "chore", use: "งานจุกจิก เช่น อัปเดต dependency", example: "อัปเดต vite เป็นเวอร์ชันล่าสุด" },
] as const;

type TypeId = (typeof types)[number]["id"];

/** Messages that say nothing about what changed. */
const vague = new Set(["update", "fix", "wip", "test", "แก้", "แก้ไข", "แก้บั๊ก", "อัปเดต", "ปรับปรุง"]);

export function CommitBuilder() {
  const [type, setType] = useState<TypeId>("feat");
  const [text, setText] = useState("เพิ่มระบบล็อกอินด้วยอีเมล");
  const { mode } = useExplainMode();

  const chosen = types.find((t) => t.id === type)!;
  const body = text.trim();
  const message = `${type}: ${body}`;

  const checks = [
    { ok: body.length > 0, label: "มีคำอธิบายหลังเครื่องหมาย :" },
    { ok: body.length >= 8 && !vague.has(body.toLowerCase()), label: "บอกว่าทำอะไร ไม่คลุมเครือ (เช่น ไม่ใช่แค่ \"update\" หรือ \"แก้\")" },
    { ok: message.length <= 72, label: `สั้นพอ อ่านจบในบรรทัดเดียว (ไม่เกิน 72 ตัวอักษร, ตอนนี้ ${message.length})` },
    { ok: !/[.。]$/.test(body), label: "ไม่ลงท้ายด้วยจุด" },
  ];
  const allOk = checks.every((c) => c.ok);
  const command = `git commit -m "${message.replace(/"/g, '\\"')}"`;

  return (
    <div data-wide className="card card--flat flex flex-col gap-5">
      <div>
        <p className="card-meta">1. เลือกประเภทงาน</p>
        <div role="radiogroup" aria-label="ประเภท commit" className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === type}
              onClick={() => {
                setType(t.id);
                setText(t.example);
              }}
              className={["btn btn--sm", t.id === type ? "btn--primary" : "btn--outlined"].join(" ")}
            >
              {t.id}:
            </button>
          ))}
        </div>
        <p className="mt-2 text-body-sm text-ink2">
          <strong className="text-ink">{chosen.id}:</strong> ใช้เมื่อ{chosen.use}
        </p>
      </div>

      <div>
        <label className="card-meta block" htmlFor="commit-text">
          2. เขียนสั้นๆ ว่าทำอะไร
        </label>
        <input
          id="commit-text"
          className="input w-full"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={chosen.example}
        />
      </div>

      <div>
        <p className="card-meta">ผลลัพธ์</p>
        <p
          className={[
            "rounded-sm border px-4 py-3 text-body-lg font-semibold",
            allOk ? "border-ok-bar bg-ok-bg text-ink2" : "border-edge bg-wash",
          ].join(" ")}
        >
          {message}
        </p>
        <ul className="mt-3 flex list-none flex-col gap-1.5 p-0">
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
      </div>

      {mode === "detail" && (
        <div>
          <p className="card-meta">คำสั่ง</p>
          <CodeBlock code={command} />
        </div>
      )}
    </div>
  );
}
