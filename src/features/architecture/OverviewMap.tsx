import { useLayoutEffect, useRef, useState } from "react";
import { useExplainMode } from "@/lib/explainMode";
import { PlannedBadge, protocols, ToolRow, type LogoId, type ProtocolId } from "./tools";

type NodeId = "client" | "server" | "google" | "db";
type LinkId = "rest" | "oidc" | "sql";

interface NodeInfo {
  title: string;
  where: string;
  tools: LogoId[];
  simple: string;
  detail: string;
}

const nodes: Record<NodeId, NodeInfo> = {
  client: {
    title: "Client (Frontend)",
    where: "ในเว็บเบราว์เซอร์ (Chrome / Edge)",
    tools: ["react", "typescript", "vite"],
    simple: "หน้าเว็บที่ผู้ใช้เห็นและกด ทำงานบนเครื่องของผู้ใช้เอง",
    detail: "app/client: React 19 + TypeScript สร้างและเปิดด้วย Vite 7 (พอร์ต 5173 ตอนพัฒนา) build ออกมาเป็นไฟล์ static แล้วนำไปวางบน Vercel",
  },
  server: {
    title: "Server (Backend)",
    where: "Node.js บน Railway / Fly.io",
    tools: ["nodejs", "typescript", "fastify", "prisma"],
    simple: "ห้องครัวของระบบ รับคำขอ ตรวจว่าเป็นใครและมีสิทธิ์ไหม ตรวจข้อมูลที่ส่งมา แล้วไปหยิบข้อมูลจากฐานข้อมูล",
    detail: "app/server: Fastify 5 (พอร์ต 3001) ด่านตรวจ 3 อย่างคือ JWT (ตัวตน), capability (สิทธิ์) และ Zod (ข้อมูลที่รับเข้า) แล้วคุยกับฐานข้อมูลผ่าน Prisma",
  },
  google: {
    title: "Google Sign-In",
    where: "บริการภายนอก · ใช้ตอนล็อกอิน",
    tools: ["google"],
    simple: "ผู้ยืนยันตัวตน ผู้ใช้ล็อกอินด้วยบัญชี Google แทนการตั้งรหัสผ่านใหม่กับระบบเรา",
    detail: "Google ออก ID token ให้เบราว์เซอร์ แล้วเบราว์เซอร์ส่งต่อให้ server ตรวจ ระบบเข้าสู่ระบบด้วย Google เท่านั้น",
  },
  db: {
    title: "ฐานข้อมูล (Database)",
    where: "PostgreSQL บน Supabase",
    tools: ["postgres", "supabase"],
    simple: "คลังเก็บข้อมูลจริงทั้งหมด: รายวิชา CLO นักศึกษา คะแนน",
    detail: "PostgreSQL 15+ ที่ Supabase ดูแลให้ (ทั้ง dev และ production) schema และ migration อยู่ใน database/",
  },
};

interface LinkInfo {
  n: string;
  from: NodeId;
  to: NodeId;
  /** Two short lines drawn on the connector: the pipe, then what travels in it. */
  pipe: string;
  carries: string;
  protocols: ProtocolId[];
  story: string;
}

const links: Record<LinkId, LinkInfo> = {
  rest: {
    n: "①",
    from: "client",
    to: "server",
    pipe: "HTTPS",
    carries: "REST/JSON + JWT",
    protocols: ["https", "rest", "jwt"],
    story: "ทุกครั้งที่ผู้ใช้กดอะไรบนหน้าเว็บ หน้าเว็บส่งคำขอไปที่ server ทางนี้ พร้อมแนบบัตรผ่าน (JWT) และ server ตอบกลับเป็น JSON",
  },
  oidc: {
    n: "②",
    from: "server",
    to: "google",
    pipe: "HTTPS",
    carries: "ตรวจ ID token",
    protocols: ["https", "oidc"],
    story: "ใช้เฉพาะตอนล็อกอิน: server นำ ID token ที่ผู้ใช้ได้จาก Google มาตรวจกับกุญแจสาธารณะของ Google ว่าเป็นของจริง",
  },
  sql: {
    n: "③",
    from: "server",
    to: "db",
    pipe: "TCP + TLS",
    carries: "SQL ผ่าน Prisma",
    protocols: ["tcpTls", "sql"],
    story: "เมื่อ server ต้องการข้อมูล จะสั่งผ่าน Prisma ซึ่งแปลงเป็น SQL แล้วส่งไปที่ฐานข้อมูลทางท่อที่เข้ารหัส",
  },
};

const linkIds = Object.keys(links) as LinkId[];

interface Geo {
  d: string;
  lx: number;
  ly: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/**
 * An elbow connector between two cards, in the container's coordinates.
 * Side by side → leaves the right edge and enters the left edge.
 * Stacked → leaves the bottom edge and enters the top edge.
 */
function connect(a: DOMRect, b: DOMRect, base: DOMRect): Geo {
  const A = { l: a.left - base.left, r: a.right - base.left, t: a.top - base.top, b: a.bottom - base.top };
  const B = { l: b.left - base.left, r: b.right - base.left, t: b.top - base.top, b: b.bottom - base.top };
  const inset = 28;

  if (B.l >= A.r - 1) {
    const sy = clamp((B.t + B.b) / 2, A.t + inset, A.b - inset);
    const ey = clamp(sy, B.t + inset, B.b - inset);
    const midX = (A.r + B.l) / 2;
    return { d: `M${A.r} ${sy} H${midX} V${ey} H${B.l}`, lx: midX, ly: (sy + ey) / 2 };
  }
  const sx = clamp((B.l + B.r) / 2, A.l + inset, A.r - inset);
  const ex = clamp(sx, B.l + inset, B.r - inset);
  const midY = (A.b + B.t) / 2;
  return { d: `M${sx} ${A.b} V${midY} H${ex} V${B.t}`, lx: (sx + ex) / 2, ly: midY };
}

function NodeCard({
  id,
  className,
  selected,
  lit,
  onSelect,
  setRef,
}: {
  id: NodeId;
  className: string;
  selected: boolean;
  lit: boolean;
  onSelect: () => void;
  setRef: (el: HTMLButtonElement | null) => void;
}) {
  const n = nodes[id];
  return (
    <button
      ref={setRef}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "relative z-[1] flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-colors",
        selected ? "border-haze ring-2 ring-haze" : lit ? "border-haze" : "border-edge hover:border-dim",
        className,
      ].join(" ")}
    >
      <span>
        <span className="block text-body font-semibold text-ink">{n.title}</span>
        <span className="block text-body-sm text-ink2">{n.where}</span>
      </span>
      <ToolRow ids={n.tools} />
    </button>
  );
}

/** Page 1 of the drawio: the four parts, joined by lines that carry their protocol. */
export function OverviewMap() {
  const [sel, setSel] = useState<NodeId | LinkId>("rest");
  const { mode } = useExplainMode();
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Partial<Record<NodeId, HTMLButtonElement | null>>>({});
  const [geo, setGeo] = useState<Partial<Record<LinkId, Geo>>>({});
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Re-measure whenever the layout can move: resize, breakpoint change, logos finishing loading.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const base = box.getBoundingClientRect();
      const next: Partial<Record<LinkId, Geo>> = {};
      for (const id of linkIds) {
        const a = cardRefs.current[links[id].from];
        const b = cardRefs.current[links[id].to];
        if (a && b) next[id] = connect(a.getBoundingClientRect(), b.getBoundingClientRect(), base);
      }
      setGeo(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    Object.values(cardRefs.current).forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, []);

  const node = sel in nodes ? nodes[sel as NodeId] : null;
  const link = sel in links ? links[sel as LinkId] : null;
  const activeLinks = new Set<LinkId>(
    link ? [sel as LinkId] : linkIds.filter((id) => links[id].from === sel || links[id].to === sel),
  );
  const litNodes = new Set<NodeId>(link ? [link.from, link.to] : []);
  const card = (id: NodeId, className: string) => (
    <NodeCard
      id={id}
      className={className}
      selected={sel === id}
      lit={litNodes.has(id)}
      onSelect={() => setSel(id)}
      setRef={(el) => {
        cardRefs.current[id] = el;
      }}
    />
  );

  return (
    <div data-wide className="flex flex-col gap-4">
      <p className="text-body-sm text-ink2">
        เส้นคือช่องทางที่ข้อมูลวิ่ง ป้ายบนเส้นบอก protocol ที่ใช้ กดที่ป้ายหรือที่กล่องเพื่ออ่านรายละเอียด
      </p>

      <div ref={boxRef} className="relative rounded-lg border border-edge bg-wash p-4 sm:p-6">
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="context-stroke" />
            </marker>
          </defs>
          {linkIds.map((id) => {
            const g = geo[id];
            if (!g) return null;
            const on = activeLinks.has(id);
            return (
              <g key={id}>
                <path
                  d={g.d}
                  fill="none"
                  stroke={on ? "var(--color-haze)" : "var(--color-dim)"}
                  strokeWidth={on ? 3 : 2}
                  strokeLinejoin="round"
                  markerStart="url(#arch-arrow)"
                  markerEnd="url(#arch-arrow)"
                />
                {on && !reduceMotion && (
                  <circle r={5} fill="var(--color-haze)">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path={g.d} />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Below 2xl: a tree (client, server, then Google and the database side by side).
            At 2xl: three columns, as drawn in the drawio. */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-28 2xl:grid-cols-3 2xl:grid-rows-2 2xl:gap-x-40 2xl:gap-y-6">
          {card("client", "col-span-2 2xl:col-span-1 2xl:col-start-1 2xl:row-span-2 2xl:self-center")}
          {card("server", "col-span-2 2xl:col-span-1 2xl:col-start-2 2xl:row-span-2 2xl:self-center")}
          {card("google", "2xl:col-start-3 2xl:row-start-1")}
          {card("db", "2xl:col-start-3 2xl:row-start-2")}
        </div>

        {linkIds.map((id) => {
          const g = geo[id];
          if (!g) return null;
          const l = links[id];
          const on = sel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSel(id)}
              aria-pressed={on}
              aria-label={`${l.n} ${nodes[l.from].title} กับ ${nodes[l.to].title}: ${l.pipe} ${l.carries}`}
              style={{ left: g.lx, top: g.ly }}
              className={[
                "absolute z-[2] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center whitespace-nowrap rounded-md border px-2.5 py-1 text-center shadow-soft transition-colors",
                on ? "border-haze bg-sel-bg ring-2 ring-haze" : "border-edge bg-card hover:border-dim",
              ].join(" ")}
            >
              <span className="text-label font-semibold text-ink">
                {l.n} {l.pipe}
              </span>
              <span className="text-caption text-ink2">{l.carries}</span>
            </button>
          );
        })}
      </div>

      <div className="card card--flat" aria-live="polite">
        {node && (
          <>
            <p className="card-meta">ส่วนของระบบ</p>
            <p className="card-title">{node.title}</p>
            <p className="text-body text-ink">{node.simple}</p>
            <div className="mt-3">
              <ToolRow ids={node.tools} />
            </div>
            {mode === "detail" && <p className="mt-3 border-t border-edge pt-3 text-body-sm text-ink2">{node.detail}</p>}
          </>
        )}
        {link && (
          <>
            <p className="card-meta">
              เส้นทาง {link.n} · {nodes[link.from].title} ↔ {nodes[link.to].title}
            </p>
            <p className="card-title">
              {link.pipe} · {link.carries}
            </p>
            <p className="text-body text-ink">{link.story}</p>
            <ul className="m-0 mt-3 flex list-none flex-col gap-3 border-t border-edge p-0 pt-3">
              {link.protocols.map((p) => (
                <li key={p} className="mt-0">
                  <p className="flex items-center gap-2 text-body font-semibold text-ink">
                    {protocols[p].name}
                    {protocols[p].planned && <PlannedBadge />}
                  </p>
                  <p className="text-body-sm text-ink2">{protocols[p].simple}</p>
                  {mode === "detail" && <p className="mt-1 text-body-sm text-ink2">{protocols[p].detail}</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
