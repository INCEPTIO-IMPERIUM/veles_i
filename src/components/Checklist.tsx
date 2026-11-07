import { RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { readJson, writeStored } from "@/lib/storage";

export interface CheckGroup {
  title?: string;
  items: { id: string; text: string }[];
}

/**
 * A checklist the reader can tick. Ticks are remembered in this browser only
 * (per `id`), so a person can come back to the same list tomorrow.
 */
export function Checklist({ id, groups }: { id: string; groups: CheckGroup[] }) {
  const key = `check:${id}`;
  const [done, setDone] = useState<string[]>(() => readJson<string[]>(key, []));

  const save = useCallback(
    (next: string[]) => {
      setDone(next);
      writeStored(key, JSON.stringify(next));
    },
    [key],
  );

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const count = groups.reduce((n, g) => n + g.items.filter((i) => done.includes(i.id)).length, 0);
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);

  const toggle = (itemId: string) =>
    save(done.includes(itemId) ? done.filter((x) => x !== itemId) : [...done, itemId]);

  return (
    <div data-wide className="card card--flat flex flex-col gap-5">
      <div className="progress">
        <div className="progress-header">
          <span className="progress-label">
            ติ๊กแล้ว {count} จาก {total} ข้อ
          </span>
          <span className="progress-value">{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill progress-fill--success" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {groups.map((g, gi) => (
        <fieldset key={g.title ?? gi} className="m-0 border-0 p-0">
          {g.title && <legend className="card-meta mb-2 p-0">{g.title}</legend>}
          <div className="flex flex-col gap-1">
            {g.items.map((it) => {
              const checked = done.includes(it.id);
              return (
                <label
                  key={it.id}
                  className="flex cursor-pointer items-start gap-3 rounded-sm px-2 py-2 text-body hover:bg-wash"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(it.id)}
                    className="mt-1 size-4 shrink-0 accent-[var(--color-haze)]"
                  />
                  <span className={checked ? "text-ink2 line-through decoration-dim" : "text-ink"}>{it.text}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {count > 0 && (
        <div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => save([])}>
            <RotateCcw size={14} /> ล้างที่ติ๊ก
          </button>
        </div>
      )}
    </div>
  );
}
