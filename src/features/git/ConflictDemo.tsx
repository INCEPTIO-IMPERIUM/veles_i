import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { useExplainMode } from "@/lib/explainMode";

type Choice = "ours" | "theirs" | "both";
type Tone = "success" | "warning" | "danger";

interface Sample {
  id: string;
  title: string;
  file: string;
  ours: string;
  theirs: string;
  /** Result code and the verdict for each choice. */
  outcome: Record<Choice, { result: string; tone: Tone; text: string }>;
}

const samples: Sample[] = [
  {
    id: "imports",
    title: "ตัวอย่าง 1: สองคนเพิ่มคนละอย่าง",
    file: "ScoreTable.tsx",
    ours: 'import { Chart } from "./Chart";',
    theirs: 'import { Table } from "./Table";',
    outcome: {
      ours: {
        result: 'import { Chart } from "./Chart";',
        tone: "warning",
        text: "ของเพื่อน (Table) หายไป ถ้าโค้ดส่วนอื่นใช้ Table อยู่ จะพังทันที ห้ามทิ้งงานเพื่อนโดยไม่ถาม",
      },
      theirs: {
        result: 'import { Table } from "./Table";',
        tone: "warning",
        text: "ของเรา (Chart) หายไป ถ้าเรายังต้องใช้ Chart จะพัง",
      },
      both: {
        result: 'import { Chart } from "./Chart";\nimport { Table } from "./Table";',
        tone: "success",
        text: "ถูกต้อง สองบรรทัดนี้เป็นคนละเรื่อง เก็บไว้ทั้งคู่ได้",
      },
    },
  },
  {
    id: "value",
    title: "ตัวอย่าง 2: สองคนแก้ค่าเดียวกัน",
    file: "grading.ts",
    ours: "const PASS_SCORE = 50;",
    theirs: "const PASS_SCORE = 60;",
    outcome: {
      ours: {
        result: "const PASS_SCORE = 50;",
        tone: "warning",
        text: "เลือกได้ แต่ห้ามตัดสินใจคนเดียวเงียบๆ ถามเจ้าของโค้ดก่อนว่าเกณฑ์ผ่านที่ถูกคือเท่าไหร่",
      },
      theirs: {
        result: "const PASS_SCORE = 60;",
        tone: "warning",
        text: "เลือกได้ แต่ห้ามตัดสินใจคนเดียวเงียบๆ ถามเจ้าของโค้ดก่อนว่าเกณฑ์ผ่านที่ถูกคือเท่าไหร่",
      },
      both: {
        result: "const PASS_SCORE = 50;\nconst PASS_SCORE = 60;",
        tone: "danger",
        text: "ใช้ไม่ได้ ประกาศชื่อเดียวกันสองครั้ง โค้ดจะ error ถ้า 2 ฝั่งแก้เรื่องเดียวกัน ต้องเลือกหรือเขียนใหม่ให้เหลืออันเดียว",
      },
    },
  },
];

const toneClass: Record<Tone, string> = {
  success: "border-ok-bar bg-ok-bg text-ink2",
  warning: "border-warn-bar bg-warn-bg text-ink2",
  danger: "border-bad-bar bg-bad-bg text-ink2",
};

const choices: { id: Choice; label: string }[] = [
  { id: "ours", label: "เก็บของเรา" },
  { id: "theirs", label: "เก็บของเขา" },
  { id: "both", label: "เก็บทั้งคู่" },
];

export function ConflictDemo() {
  const [sampleId, setSampleId] = useState(samples[0]!.id);
  const [choice, setChoice] = useState<Choice | null>(null);
  const { mode } = useExplainMode();

  const sample = samples.find((s) => s.id === sampleId)!;
  const outcome = choice ? sample.outcome[choice] : null;

  const pickSample = (id: string) => {
    setSampleId(id);
    setChoice(null);
  };

  return (
    <div data-wide className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="เลือกตัวอย่าง" className="flex flex-wrap gap-2">
        {samples.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === sampleId}
            onClick={() => pickSample(s.id)}
            className={["btn btn--sm", s.id === sampleId ? "btn--primary" : "btn--outlined"].join(" ")}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-edge">
        <p className="border-b border-edge bg-wash px-4 py-2 text-label font-semibold text-ink2">
          {sample.file} · Git ไม่รู้ว่าจะเชื่อใคร เลยหยุดและให้เราเลือก
        </p>
        <pre className="m-0 overflow-x-auto bg-card p-0 text-code leading-loose">
          <Line tone="marker">{"<<<<<<< HEAD"}</Line>
          <Line tone="ours">{sample.ours}</Line>
          <Line tone="marker">{"======="}</Line>
          <Line tone="theirs">{sample.theirs}</Line>
          <Line tone="marker">{">>>>>>> develop"}</Line>
        </pre>
        <p className="border-t border-edge bg-wash px-4 py-2 text-caption text-ink2">
          <span className="font-semibold text-haze">ส่วนบน</span> = ของเรา (branch ที่เราอยู่) ·{" "}
          <span className="font-semibold text-ink2">ส่วนล่าง</span> = ของที่รวมเข้ามา (develop)
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-body-sm font-semibold">คุณจะเลือกอย่างไร</span>
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setChoice(c.id)}
            aria-pressed={choice === c.id}
            className={["btn btn--sm", choice === c.id ? "btn--primary" : "btn--outlined"].join(" ")}
          >
            {c.label}
          </button>
        ))}
      </div>

      {outcome && choice && (
        <div className="flex flex-col gap-3" aria-live="polite">
          <div className={`rounded-sm border px-4 py-3 text-body ${toneClass[outcome.tone]}`}>{outcome.text}</div>
          <div>
            <p className="card-meta">ไฟล์หลังแก้ (ลบเครื่องหมาย &lt;&lt;&lt; === &gt;&gt;&gt; ออกหมดแล้ว)</p>
            <CodeBlock code={outcome.result} />
          </div>
          {mode === "detail" ? (
            <div>
              <p className="card-meta">ขั้นต่อไป: บอก Git ว่าแก้เสร็จแล้ว</p>
              <CodeBlock code={`git add ${sample.file}\ngit commit -m "fix: resolve merge conflict"`} />
            </div>
          ) : (
            <p className="text-body-sm text-ink2">
              แก้เสร็จแล้ว ต้องบอก Git ด้วยว่า "เรียบร้อย" แล้วบันทึกอีกครั้ง คำสั่งจริงดูได้ใน "แบบละเอียด"
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Line({ tone, children }: { tone: "marker" | "ours" | "theirs"; children: string }) {
  const style =
    tone === "marker"
      ? "text-ink2"
      : tone === "ours"
        ? "bg-sel-bg text-sel"
        : "bg-warn-bg text-ink2";
  return <span className={`block px-4 py-0.5 ${style}`}>{children}</span>;
}
