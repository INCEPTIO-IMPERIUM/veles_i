import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useExplainMode } from "@/lib/explainMode";
import { PlannedBadge, protocols, ToolRow, type LogoId, type ProtocolId } from "./tools";

type TierId = "users" | "frontend" | "backend" | "db" | "google" | "tooling";

interface Item {
  text: string;
  planned?: boolean;
}

interface Tier {
  title: string;
  sub: string;
  tools: LogoId[];
  items: Item[];
  /** Layout on the big grid. */
  area: string;
}

/**
 * Page 3 of the drawio ("Detailed architecture"). Items marked `planned` are drawn there but
 * were not found in app/server, app/client or database/ on `develop` on 2026-11-08.
 */
const tiers: Record<TierId, Tier> = {
  users: {
    title: "ผู้ใช้ (Users)",
    sub: "สองบทบาท",
    tools: ["chrome"],
    items: [
      { text: "Instructor: สอน · นำเข้าคะแนน · เห็นเฉพาะวิชาของตน" },
      { text: "ADMIN: อนุมัติผู้ใช้ · เห็นทุกวิชา · ไม่ทำงานสอน (D-1)" },
    ],
    area: "lg:col-start-1 lg:row-start-1",
  },
  frontend: {
    title: "Frontend",
    sub: "Browser · Vite :5173 · app/client",
    tools: ["react", "typescript", "vite", "tailwind", "router", "query", "zustand"],
    items: [
      { text: "React Router 7: ตารางเส้นทาง (pages.config.ts)" },
      { text: "TanStack Query: ดึงและจำข้อมูลจาก server" },
      { text: "Zustand: เก็บสถานะ auth เท่านั้น" },
      { text: "shadcn/ui + Tailwind v4: หน้าตา" },
      { text: "recharts · sonner: กราฟและแจ้งเตือน" },
      { text: "xlsx: อ่านไฟล์ Excel" },
      { text: "features/*: page → hook → api" },
      { text: "apiClient: แนบ JWT และแจ้ง error" },
      { text: "apiClient: refresh token อัตโนมัติ", planned: true },
      { text: "Build: Vite → static bundle (dist/)" },
    ],
    area: "lg:col-start-2 lg:row-start-1",
  },
  backend: {
    title: "Backend",
    sub: "Node.js · Fastify 5 :3001 · app/server",
    tools: ["nodejs", "typescript", "fastify", "prisma", "zod", "jose"],
    items: [
      { text: "Helmet (CSP) · CORS · Rate limit · Multipart 10 MB (Excel)" },
      { text: "access.middleware → authMiddleware (อ่านแถว User สด) → authorize(): 404 ไม่ใช่ 403" },
      { text: "Route → Controller → Service → Repository" },
      { text: "Zod (ตรวจข้อมูล) · jose (JWT) · argon2 (รหัสผ่าน)" },
      { text: "modules ที่มีแล้ว: auth · authorization · users · health" },
      { text: "modules ที่ยังไม่มี: courses · clos · activities · scores · students · dashboard", planned: true },
      { text: "Server-Sent Events (อัปเดตสด)", planned: true },
    ],
    area: "lg:col-start-3 lg:row-start-1",
  },
  db: {
    title: "ฐานข้อมูล",
    sub: "PostgreSQL บน Supabase",
    tools: ["postgres", "supabase"],
    items: [
      { text: "Prisma schema + migrations (ในโค้ดตอนนี้ 0001–0007)" },
      { text: "ตาราง: User · Course · CLO · Activity · Score …" },
      { text: "Session pooler :5432 · sslmode=require" },
      { text: "RLS เปิด · ปิด Supabase Data API (migration 0009)", planned: true },
      { text: "ตาราง RefreshToken", planned: true },
    ],
    area: "lg:col-start-4 lg:row-start-1",
  },
  google: {
    title: "บริการภายนอก: Google Identity",
    sub: "Google Sign-In (OIDC)",
    tools: ["google"],
    items: [{ text: "ID token → server ตรวจ aud · iss · exp ด้วย JWKS" }],
    area: "lg:col-start-3 lg:col-span-2 lg:row-start-2",
  },
  tooling: {
    title: "Delivery & tooling",
    sub: "ตรวจและส่งมอบงาน",
    tools: ["actions", "vitest", "playwright", "eslint"],
    items: [
      { text: "npm workspaces · CI gate (unit · e2e · scans)" },
      { text: "Git Flow: ทุก branch → develop, main รับแค่ release / hotfix" },
    ],
    area: "lg:col-start-1 lg:col-span-2 lg:row-start-2",
  },
};

interface Flow {
  id: string;
  n: string;
  label: string;
  from: TierId;
  to: TierId;
  protocols: ProtocolId[];
  simple: string;
}

const flows: Flow[] = [
  { id: "f1", n: "①", label: "HTTPS", from: "users", to: "frontend", protocols: ["https"], simple: "ผู้ใช้เปิดเว็บและกดปุ่มผ่านเบราว์เซอร์" },
  {
    id: "f2",
    n: "②",
    label: "REST/JSON · Bearer JWT · cookie",
    from: "frontend",
    to: "backend",
    protocols: ["https", "rest", "jwt", "cookie"],
    simple: "หน้าเว็บเรียก API ของ server พร้อมแนบบัตรผ่าน (JWT)",
  },
  {
    id: "f3",
    n: "③",
    label: "Prisma · SQL",
    from: "backend",
    to: "db",
    protocols: ["sql", "tcpTls"],
    simple: "server ขอข้อมูลจากฐานข้อมูลผ่าน Prisma",
  },
  {
    id: "f4",
    n: "④",
    label: "Sign-In → ID token",
    from: "frontend",
    to: "google",
    protocols: ["oidc"],
    simple: "ผู้ใช้ล็อกอินกับ Google แล้วได้ ID token กลับมาที่เบราว์เซอร์",
  },
  {
    id: "f5",
    n: "⑤",
    label: "ตรวจ ID token",
    from: "backend",
    to: "google",
    protocols: ["oidc", "https"],
    simple: "server นำ ID token ไปตรวจว่าเป็นของจริงและเป็นของแอปเรา",
  },
  {
    id: "f6",
    n: "↩",
    label: "SSE live updates",
    from: "backend",
    to: "frontend",
    protocols: ["sse"],
    simple: "server ส่งข้อมูลใหม่ไปหาหน้าเว็บได้เองโดยไม่ต้องรอถาม",
  },
];

/** The detailed architecture: every tier with its tools, and the numbered lines between them. */
export function DetailMap() {
  const [flowId, setFlowId] = useState("f2");
  const { mode } = useExplainMode();
  const flow = flows.find((f) => f.id === flowId)!;
  const touched = new Set<TierId>([flow.from, flow.to]);

  return (
    <div data-wide className="flex flex-col gap-4">
      <div>
        <p className="card-meta">เลือกเส้นทางข้อมูล แล้วดูว่าเชื่อมส่วนไหนกับส่วนไหน</p>
        <div role="radiogroup" aria-label="เส้นทางข้อมูล" className="flex flex-wrap gap-2">
          {flows.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={f.id === flowId}
              onClick={() => setFlowId(f.id)}
              className={["btn btn--sm", f.id === flowId ? "btn--primary" : "btn--outlined"].join(" ")}
            >
              {f.n} {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-edge bg-wash p-4 lg:grid-cols-4">
        {(Object.keys(tiers) as TierId[]).map((id) => {
          const t = tiers[id];
          const on = touched.has(id);
          return (
            <section
              key={id}
              aria-label={t.title}
              className={[
                "flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors",
                on ? "border-haze ring-2 ring-haze" : "border-edge",
                t.area,
              ].join(" ")}
            >
              <header>
                <h4 className="text-body font-semibold text-ink">{t.title}</h4>
                <p className="text-body-sm text-ink2">{t.sub}</p>
              </header>
              <ToolRow ids={t.tools} size={28} />
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-body-sm text-ink2">
                {t.items.map((it) => (
                  <li key={it.text} className="mt-0 flex flex-wrap items-start gap-x-2">
                    <span>{it.text}</span>
                    {it.planned && <PlannedBadge />}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="card card--flat" aria-live="polite">
        <p className="card-meta">เส้นทาง {flow.n}</p>
        <p className="card-title flex flex-wrap items-center gap-2">
          {tiers[flow.from].title}
          <ArrowRight size={18} className="text-dim" aria-hidden />
          {tiers[flow.to].title}
        </p>
        <p className="text-body text-ink">{flow.simple}</p>
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {flow.protocols.map((p) => (
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
      </div>
    </div>
  );
}
