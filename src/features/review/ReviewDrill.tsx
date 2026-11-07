import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";

interface Line {
  code: string;
  /** Present only on a line a reviewer should flag. */
  issue?: string;
}

/**
 * The practice diff. Five lines have a real problem, each one a rule from the
 * team's checklists (code-rule §3, security-rule §4, dev.md §8.2). The rest are fine.
 */
const lines: Line[] = [
  { code: 'import { prisma } from "../../db/prisma.js"', issue: "Service ห้าม import prisma ตรงๆ ต้องผ่าน repository (code-rule §3)" },
  { code: "" },
  { code: "export class ScoreService {" },
  {
    code: "  async saveScores(courseId: string, rows: any[]) {",
    issue: "ใช้ any และไม่ได้ตรวจแถวด้วย Zod กับไม่มีการตรวจสิทธิ์ว่าผู้เรียกเป็นอาจารย์ของ courseId นี้ (ห้ามเชื่อ courseId จาก client)",
  },
  { code: '    console.log("saving", rows)', issue: "log ข้อมูลนักศึกษา (ชื่อ รหัส คะแนน) ห้าม log ข้อมูลส่วนบุคคล เก็บแค่ id" },
  { code: "    for (const row of rows) {" },
  {
    code: "      const student = await prisma.student.findFirst({ where: { code: row.code } })",
    issue: "query ในลูป (N+1) ควรดึงนักศึกษาทั้งหมดครั้งเดียวด้วย findMany",
  },
  {
    code: "      await prisma.score.create({ data: { studentId: student.id, value: row.score } })",
    issue: "เขียนทีละแถวโดยไม่มี transaction ถ้าพังกลางทาง คะแนนจะค้างครึ่งเดียว และ student อาจเป็น null",
  },
  { code: "    }" },
  { code: "    return { saved: rows.length }" },
  { code: "  }" },
  { code: "}" },
];

const issueCount = lines.filter((l) => l.issue).length;

/** "Review this diff." Click the lines you would flag, then check. */
export function ReviewDrill() {
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  const toggle = (i: number) => {
    if (checked) return;
    setFlagged((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const hits = [...flagged].filter((i) => lines[i]?.issue).length;
  const falseAlarms = [...flagged].filter((i) => !lines[i]?.issue).length;
  const missed = lines.map((l, i) => (l.issue && !flagged.has(i) ? i : -1)).filter((i) => i >= 0);

  const reset = () => {
    setFlagged(new Set());
    setChecked(false);
  };

  return (
    <div data-wide className="flex flex-col gap-4">
      <p className="text-body-sm text-ink2">
        PR นี้เพิ่มฟังก์ชันบันทึกคะแนน กดที่บรรทัดที่คุณจะคอมเมนต์ (กดซ้ำเพื่อยกเลิก) แล้วกด "ตรวจคำตอบ" มีบรรทัดที่มีปัญหาจริง {issueCount} บรรทัด
      </p>

      <div role="group" aria-label="โค้ดใน PR" className="overflow-x-auto rounded-md border border-edge bg-card">
        {lines.map((l, i) => {
          const isFlagged = flagged.has(i);
          const real = !!l.issue;
          const state = !checked
            ? isFlagged
              ? "bg-warn-bg"
              : "hover:bg-wash"
            : real && isFlagged
              ? "bg-ok-bg"
              : real
                ? "bg-bad-bg"
                : isFlagged
                  ? "bg-warn-bg"
                  : "";
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isFlagged}
                disabled={checked || l.code === ""}
                className={`flex w-full items-center gap-3 px-3 py-1 text-left font-mono text-code ${state}`}
              >
                <span className="w-6 shrink-0 text-right text-caption text-dim">{i + 1}</span>
                <span className="w-4 shrink-0">
                  {isFlagged && !checked && <span aria-label="ติดธง">⚑</span>}
                  {checked && real && isFlagged && <Check size={14} className="text-ok" aria-label="จับได้" />}
                  {checked && real && !isFlagged && <X size={14} className="text-bad" aria-label="พลาด" />}
                  {checked && !real && isFlagged && <X size={14} className="text-warn" aria-label="ไม่ใช่ปัญหา" />}
                </span>
                <span className="whitespace-pre text-ink">{l.code || " "}</span>
              </button>
              {checked && real && (
                <p className="border-t border-edge bg-wash px-3 py-2 pl-[4.5rem] text-body-sm text-ink2">{l.issue}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-edge bg-wash px-5 py-4">
        {!checked ? (
          <>
            <span className="text-body">ติดธงแล้ว {flagged.size} บรรทัด</span>
            <button type="button" className="btn btn--primary btn--sm ml-auto" onClick={() => setChecked(true)} disabled={flagged.size === 0}>
              ตรวจคำตอบ
            </button>
          </>
        ) : (
          <>
            <span className="text-body">
              จับได้ {hits} จาก {issueCount} · พลาด {missed.length} · ติดธงเกิน {falseAlarms}
            </span>
            <button type="button" className="btn btn--outlined btn--sm ml-auto" onClick={reset}>
              <RotateCcw size={14} /> ลองใหม่
            </button>
          </>
        )}
      </div>
    </div>
  );
}
