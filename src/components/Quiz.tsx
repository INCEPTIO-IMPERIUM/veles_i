import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index into options. */
  answer: number;
  /** Shown after the reader picks, right or wrong. */
  why: string;
}

/** Self-check at the end of a page. Nothing is stored: it's for the reader, not a grade. */
export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length;
  const score = questions.filter((q, i) => picked[i] === q.answer).length;

  return (
    <div data-wide className="flex flex-col gap-4">
      {questions.map((q, qi) => {
        const choice = picked[qi];
        const done = choice !== undefined;
        return (
          <div key={q.q} className="card card--flat">
            <p className="card-meta">
              ข้อ {qi + 1} จาก {questions.length}
            </p>
            <p className="card-title mb-3">{q.q}</p>
            <div role="radiogroup" aria-label={q.q} className="flex flex-col gap-2">
              {q.options.map((opt, oi) => {
                const isPicked = choice === oi;
                const isRight = oi === q.answer;
                const state = !done
                  ? "border-edge hover:border-dim"
                  : isRight
                    ? "border-ok-bar bg-ok-bg text-ink2"
                    : isPicked
                      ? "border-bad-bar bg-bad-bg text-ink2"
                      : "border-edge opacity-60";
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={isPicked}
                    disabled={done}
                    onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                    className={`flex items-center gap-3 rounded-sm border px-4 py-2.5 text-left text-body transition-colors ${state}`}
                  >
                    <span className="flex-1">{opt}</span>
                    {done && isRight && <Check size={16} aria-label="ถูก" />}
                    {done && isPicked && !isRight && <X size={16} aria-label="ผิด" />}
                  </button>
                );
              })}
            </div>
            {done && (
              <p className="mt-3 text-body-sm text-ink2" role="status">
                <strong className="text-ink">{choice === q.answer ? "ถูกต้อง " : "ยังไม่ใช่ "}</strong>
                {q.why}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-edge bg-wash px-5 py-4">
        <span className="text-body">
          {answered < questions.length
            ? `ตอบแล้ว ${answered} จาก ${questions.length} ข้อ`
            : `ได้ ${score} จาก ${questions.length} ข้อ${score === questions.length ? " ครบทุกข้อ" : " ลองอ่านข้อที่ผิดอีกรอบ"}`}
        </span>
        {answered > 0 && (
          <button type="button" className="btn btn--outlined btn--sm" onClick={() => setPicked({})}>
            <RotateCcw size={14} /> ทำใหม่
          </button>
        )}
      </div>
    </div>
  );
}
