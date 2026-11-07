import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { useExplainMode } from "@/lib/explainMode";
import { scenarios, type Commit, type LaneId, type Scenario } from "./gitFlow.data";

const COL = 88;
const ROW = 66;
const LEFT = 140;
const TOP = 8;
const PAD_R = 28;

const laneColor: Record<LaneId, string> = {
  main: "var(--color-ink)",
  develop: "var(--color-cool)",
  feature: "var(--color-mount)",
  backmerge: "var(--color-mount)",
  release: "var(--color-warn-bar)",
  hotfix: "var(--color-bad-bar)",
};

interface Line {
  key: string;
  from: Commit;
  to: Commit;
  step: number;
  kind: "line" | "branch" | "merge";
}

/** Same-lane commits are joined automatically; cross-lane links come from the data. */
function buildLines(s: Scenario, step: number): Line[] {
  const byId = new Map(s.commits.map((c) => [c.id, c]));
  const lines: Line[] = [];

  for (const lane of s.lanes) {
    const inLane = s.commits.filter((c) => c.lane === lane.id).sort((a, b) => a.x - b.x);
    for (let i = 1; i < inLane.length; i++) {
      const a = inLane[i - 1]!;
      const b = inLane[i]!;
      lines.push({ key: `${a.id}-${b.id}`, from: a, to: b, step: Math.max(a.step, b.step), kind: "line" });
    }
  }
  for (const l of s.links) {
    const from = byId.get(l.from);
    const to = byId.get(l.to);
    if (from && to) {
      lines.push({
        key: `${l.from}>${l.to}`,
        from,
        to,
        step: Math.max(l.step, from.step, to.step),
        kind: l.kind,
      });
    }
  }
  return lines.filter((l) => l.step <= step);
}

function Diagram({ scenario, step }: { scenario: Scenario; step: number }) {
  const current = scenario.steps[step]!;
  const focus = new Set(current.focus ?? []);
  const faded = new Set<LaneId>(current.fade ?? []);
  const laneIndex = new Map(scenario.lanes.map((l, i) => [l.id, i]));

  const maxX = Math.max(...scenario.commits.map((c) => c.x));
  const width = LEFT + (maxX + 1) * COL + PAD_R;
  const height = TOP * 2 + scenario.lanes.length * ROW;

  const pos = (c: Commit) => ({
    x: LEFT + (c.x + 0.5) * COL,
    y: TOP + (laneIndex.get(c.lane) ?? 0) * ROW + ROW / 2,
  });

  const commits = scenario.commits.filter((c) => c.step <= step);
  const visible = new Map(commits.map((c) => [c.id, c]));
  const lines = buildLines(scenario, step);
  const badges = scenario.badges.filter((b) => b.step <= step && visible.has(b.at));

  const summary = `ขั้น ${step + 1}: ${current.title}`;

  return (
    <svg
      role="img"
      aria-label={`แผนผัง ${scenario.title} ${summary}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block"
      style={{ minWidth: width }}
    >
      {scenario.lanes.map((lane, i) => (
        <g key={lane.id}>
          <rect
            x={0}
            y={TOP + i * ROW}
            width={width}
            height={ROW}
            fill={i % 2 === 0 ? "var(--color-wash)" : "transparent"}
          />
          <text x={14} y={TOP + i * ROW + ROW / 2 - 2} fontSize={12} fontWeight={600} fill="var(--color-ink)">
            {lane.label}
          </text>
          <text
            x={14}
            y={TOP + i * ROW + ROW / 2 + 13}
            fontSize={10}
            fill="var(--color-ink2)"
          >
            {lane.hint}
          </text>
        </g>
      ))}

      {lines.map((l) => {
        const a = pos(l.from);
        const b = pos(l.to);
        const color = laneColor[l.kind === "branch" ? l.to.lane : l.from.lane];
        const now = l.step === step;
        const dim = faded.has(l.from.lane) && faded.has(l.to.lane);
        const mid = (a.x + b.x) / 2;
        const d =
          a.y === b.y ? `M${a.x} ${a.y} L${b.x} ${b.y}` : `M${a.x} ${a.y} C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
        return (
          <path
            key={l.key}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={now ? 3 : 2}
            strokeDasharray={l.kind === "merge" ? "5 4" : undefined}
            opacity={dim ? 0.3 : 1}
            strokeLinecap="round"
          />
        );
      })}

      {commits.map((c) => {
        const { x, y } = pos(c);
        const color = laneColor[c.lane];
        const now = c.step === step || focus.has(c.id);
        return (
          <g key={c.id} opacity={faded.has(c.lane) ? 0.35 : 1}>
            {now && <circle cx={x} cy={y} r={17} fill={color} opacity={0.18} />}
            <circle cx={x} cy={y} r={9} fill={color} stroke="var(--color-card)" strokeWidth={2} />
            {c.merge && <circle cx={x} cy={y} r={3.5} fill="var(--color-card)" />}
            {c.label && (
              <text x={x} y={y + 26} textAnchor="middle" fontSize={10} fill="var(--color-ink2)">
                {c.label}
              </text>
            )}
          </g>
        );
      })}

      {badges.map((b) => {
        const c = visible.get(b.at)!;
        const { x, y } = pos(c);
        const sameAnchor = badges.filter((o) => o.at === b.at);
        const row = sameAnchor.indexOf(b);
        const w = b.text.length * 7.5 + 16;
        const by = y - 36 - row * 20;
        return (
          <g key={`${b.at}-${b.text}`}>
            <rect
              x={x - w / 2}
              y={by - 9}
              width={w}
              height={18}
              rx={9}
              fill={b.tone === "tag" ? "var(--color-ink)" : "var(--color-sel-bg)"}
            />
            <text
              x={x}
              y={by + 4}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={b.tone === "tag" ? "var(--color-card)" : "var(--color-sel)"}
            >
              {b.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function GitFlow() {
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>("feature");
  const [step, setStep] = useState(0);
  const { mode } = useExplainMode();
  const scroller = useRef<HTMLDivElement>(null);

  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  const current = scenario.steps[step]!;
  const last = scenario.steps.length - 1;

  // On narrow screens the diagram scrolls sideways: keep what this step changed in view.
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    const focus = new Set(current.focus ?? []);
    const touched = scenario.commits.filter((c) => c.step === step || focus.has(c.id));
    if (touched.length === 0) return;
    const cx = LEFT + (Math.max(...touched.map((c) => c.x)) + 0.5) * COL;
    box.scrollTo({ left: Math.max(0, cx - box.clientWidth / 2), behavior: "smooth" });
  }, [scenario, step, current]);

  const pickScenario = (id: Scenario["id"]) => {
    setScenarioId(id);
    setStep(0);
  };

  return (
    <div data-wide className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="เลือกสถานการณ์" className="grid gap-2 sm:grid-cols-3">
        {scenarios.map((s) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pickScenario(s.id)}
              className={[
                "rounded-md border px-4 py-3 text-left transition-colors",
                active
                  ? "border-haze bg-sel-bg text-sel ring-2 ring-haze"
                  : "border-edge bg-card hover:border-dim",
              ].join(" ")}
            >
              <span className="block text-body font-semibold">{s.title}</span>
              <span className="block text-body-sm opacity-80">{s.blurb}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={scroller}
        className="overflow-x-auto rounded-md border border-edge bg-card"
      >
        <Diagram scenario={scenario} step={step} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn--outlined btn--sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft size={16} /> ก่อนหน้า
        </button>
        <ol className="m-0 flex flex-1 list-none flex-wrap justify-center gap-1.5 p-0" aria-label="ขั้นตอน">
          {scenario.steps.map((s, i) => (
            <li key={s.title} className="mt-0">
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-label={`ขั้น ${i + 1}: ${s.title}`}
                aria-current={i === step ? "step" : undefined}
                className={[
                  "size-8 rounded-full text-label font-semibold transition-colors",
                  i === step
                    ? "bg-ink text-card"
                    : i < step
                      ? "bg-sel-bg text-sel"
                      : "bg-field text-ink2 hover:bg-edge",
                ].join(" ")}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setStep((s) => Math.min(last, s + 1))}
          disabled={step === last}
        >
          ถัดไป <ChevronRight size={16} />
        </button>
      </div>

      <div className="card card--flat" aria-live="polite">
        <p className="card-meta">
          ขั้น {step + 1} จาก {scenario.steps.length}
        </p>
        <p className="card-title">{current.title}</p>
        <p className="text-body text-ink">{current.simple}</p>
        {mode === "detail" ? (
          <div className="mt-3 flex flex-col gap-3 border-t border-edge pt-3">
            <p className="text-body-sm text-ink2">{current.detail}</p>
            {current.command && <CodeBlock code={current.command} />}
          </div>
        ) : (
          <p className="mt-3 text-body-sm text-ink2">
            อยากเห็นคำสั่งจริงของขั้นนี้ กด "แบบละเอียด" ที่แถบด้านบน
          </p>
        )}
      </div>
    </div>
  );
}
