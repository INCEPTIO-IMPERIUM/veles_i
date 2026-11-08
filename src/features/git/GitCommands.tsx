import { ArrowRight, Search, ShieldAlert, Users } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import {
  commands,
  groupLabels,
  riskLabels,
  zoneOrder,
  zones,
  type GitCommand,
  type Group,
  type Risk,
  type Zone,
} from "./gitCommands.data";

const riskStyle: Record<Risk, string> = {
  safe: "badge--success",
  care: "badge--warning",
  danger: "badge--danger",
};

const riskDot: Record<Risk, string> = {
  safe: "bg-ok-bar",
  care: "bg-warn-bar",
  danger: "bg-bad-bar",
};

/** Where the selected command moves work: the four places your changes can live. */
function ZoneBar({ cmd }: { cmd: GitCommand }) {
  const [from, to] = cmd.flow ?? [];
  const within = from && from === to;

  const tone = (z: Zone) =>
    z === to
      ? "border-haze bg-sel-bg text-sel ring-2 ring-haze"
      : z === from
        ? "border-haze border-dashed bg-card text-ink"
        : "border-edge bg-card text-ink2";

  return (
    <div className="rounded-lg border border-edge bg-wash p-4">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch">
        {zoneOrder.map((z, i) => (
          <Fragment key={z}>
            <div className={`flex-1 rounded-md border px-3 py-2 text-center transition-colors ${tone(z)}`}>
              <p className="text-body-sm font-semibold">{zones[z].title}</p>
              <p className="text-caption opacity-80">{zones[z].sub}</p>
            </div>
            {i < zoneOrder.length - 1 && (
              <ArrowRight size={16} className="hidden shrink-0 self-center text-dim sm:block" aria-hidden />
            )}
          </Fragment>
        ))}
      </div>
      <p className="mt-3 text-center text-body-sm text-ink2" aria-live="polite">
        {!cmd.flow && (
          <>
            <strong className="text-ink">{cmd.id === "config" ? "ตั้งค่า" : "อ่านอย่างเดียว"}</strong> · คำสั่งนี้ไม่ย้ายงานไปไหน
          </>
        )}
        {cmd.flow && within && (
          <>
            เปลี่ยนแปลงภายใน <strong className="text-ink">{zones[from!].title}</strong> (ประวัติถูกจัดใหม่ หรือมี commit เพิ่ม)
          </>
        )}
        {cmd.flow && !within && (
          <>
            ย้ายงานจาก <strong className="text-ink">{zones[from!].title}</strong> → <strong className="text-ink">{zones[to!].title}</strong>
          </>
        )}
      </p>
    </div>
  );
}

/** Searchable cheat sheet of everyday Git commands with what each one actually moves. */
export function GitCommands() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<Group | "all">("all");
  const [selectedId, setSelectedId] = useState("commit");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return commands.filter(
      (c) =>
        (group === "all" || c.group === group) &&
        (!q || [c.cmd, c.short, c.simple, c.when].join(" ").toLowerCase().includes(q)),
    );
  }, [query, group]);

  const cmd = commands.find((c) => c.id === selectedId) ?? commands[0]!;
  const groups = Object.keys(groupLabels) as Group[];

  return (
    <div data-wide className="flex flex-col gap-4">
      <ZoneBar cmd={cmd} />

      <div className="flex flex-col gap-3">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink2" aria-hidden />
          <input
            className="input w-full pl-9"
            placeholder="ค้นหาคำสั่ง เช่น fetch, rebase, ย้อน"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="ค้นหาคำสั่ง Git"
          />
        </label>
        <div role="radiogroup" aria-label="หมวดคำสั่ง" className="flex flex-wrap gap-2">
          {(["all", ...groups] as const).map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={group === g}
              onClick={() => setGroup(g)}
              className={["btn btn--sm", group === g ? "btn--primary" : "btn--outlined"].join(" ")}
            >
              {g === "all" ? "ทั้งหมด" : groupLabels[g]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ul className="m-0 flex max-h-[34rem] list-none flex-col gap-1.5 overflow-y-auto p-0 pr-1" aria-label="คำสั่ง">
          {shown.length === 0 && <li className="mt-0 px-2 py-6 text-center text-body-sm text-ink2">ไม่พบคำสั่งนี้</li>}
          {shown.map((c) => (
            <li key={c.id} className="mt-0">
              <button
                type="button"
                onClick={() => setSelectedId(c.id)}
                aria-pressed={c.id === cmd.id}
                className={[
                  "flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left transition-colors",
                  c.id === cmd.id ? "border-haze bg-sel-bg" : "border-edge bg-card hover:border-dim",
                ].join(" ")}
              >
                <span className={`size-2.5 shrink-0 rounded-full ${riskDot[c.risk]}`} aria-label={riskLabels[c.risk]} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-body-sm font-semibold text-ink">{c.cmd.split("\n")[0]}</span>
                  <span className="block truncate text-caption text-ink2">{c.short}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="card card--flat order-first h-fit lg:order-none" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <span className="card-meta mb-0">{groupLabels[cmd.group]}</span>
            <span className={`badge ${riskStyle[cmd.risk]}`}>{riskLabels[cmd.risk]}</span>
          </div>
          <p className="card-title mt-1">{cmd.short}</p>
          <CodeBlock code={cmd.cmd} />
          <p className="mt-3 text-body text-ink">{cmd.simple}</p>
          <p className="mt-2 text-body-sm text-ink2">
            <strong className="text-ink">ใช้เมื่อ: </strong>
            {cmd.when}
          </p>
          {cmd.caution && (
            <div className={`alert mt-4 ${cmd.risk === "danger" ? "alert--danger" : "alert--warning"}`}>
              <ShieldAlert size={18} className="alert-icon" aria-hidden />
              <div>
                <p className="alert-title">ระวัง</p>
                <p className="alert-body">{cmd.caution}</p>
              </div>
            </div>
          )}
          {cmd.team && (
            <div className="alert alert--brand mt-3">
              <Users size={18} className="alert-icon" aria-hidden />
              <div>
                <p className="alert-title">กติกาทีม</p>
                <p className="alert-body">{cmd.team}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
