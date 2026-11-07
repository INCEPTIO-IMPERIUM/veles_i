import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";

export interface SortItem {
  /** What the reader sees: a description or one line of code. */
  text: string;
  code?: boolean;
  /** `id` of the right choice. */
  answer: string;
  why: string;
}

export interface SortChoice {
  id: string;
  label: string;
}

/**
 * "Which bucket does this belong in?" One card per item, instant feedback,
 * score at the end. Used for code layers, committable files, and so on.
 */
export function Sorter({
  items,
  choices,
  prompt = "อยู่หมวดไหน",
}: {
  items: SortItem[];
  choices: SortChoice[];
  prompt?: string;
}) {
  const [picked, setPicked] = useState<Record<number, string>>({});
  const answered = Object.keys(picked).length;
  const score = items.filter((it, i) => picked[i] === it.answer).length;

  return (
    <div data-wide className="flex flex-col gap-3">
      {items.map((it, i) => {
        const choice = picked[i];
        const done = choice !== undefined;
        const right = choice === it.answer;
        return (
          <div key={it.text} className="card card--flat">
            <p className="card-meta">
              ข้อ {i + 1} จาก {items.length} · {prompt}
            </p>
            {it.code ? (
              <pre className="m-0 mb-3 overflow-x-auto rounded-sm border border-edge bg-wash p-3 text-code">
                <code>{it.text}</code>
              </pre>
            ) : (
              <p className="mb-3 text-body text-ink">{it.text}</p>
            )}
            <div role="radiogroup" aria-label={it.text} className="flex flex-wrap gap-2">
              {choices.map((c) => {
                const isPicked = choice === c.id;
                const isAnswer = c.id === it.answer;
                const style = !done
                  ? "btn--outlined"
                  : isAnswer
                    ? "border-ok-bar! bg-ok-bg! text-ink"
                    : isPicked
                      ? "border-bad-bar! bg-bad-bg! text-ink"
                      : "btn--outlined opacity-50";
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={isPicked}
                    disabled={done}
                    onClick={() => setPicked((p) => ({ ...p, [i]: c.id }))}
                    className={`btn btn--sm ${style}`}
                  >
                    {done && isAnswer && <Check size={14} aria-label="ถูก" />}
                    {done && isPicked && !isAnswer && <X size={14} aria-label="ผิด" />}
                    {c.label}
                  </button>
                );
              })}
            </div>
            {done && (
              <p className="mt-3 text-body-sm text-ink2" role="status">
                <strong className="text-ink">
                  {right ? "ถูกต้อง " : `ที่ถูกคือ ${choices.find((c) => c.id === it.answer)?.label} `}
                </strong>
                {it.why}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-edge bg-wash px-5 py-4">
        <span className="text-body">
          {answered < items.length
            ? `ตอบแล้ว ${answered} จาก ${items.length} ข้อ`
            : `ได้ ${score} จาก ${items.length} ข้อ${score === items.length ? " ครบทุกข้อ" : " ลองอ่านข้อที่ผิดอีกรอบ"}`}
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
