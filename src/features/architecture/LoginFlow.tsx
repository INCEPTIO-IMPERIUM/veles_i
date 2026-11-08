import { ChevronLeft, ChevronRight, CircleX } from "lucide-react";
import { useState } from "react";
import { useExplainMode } from "@/lib/explainMode";
import { PlannedBadge, protocols, Tool, type LogoId, type ProtocolId } from "./tools";

type Lane = "user" | "google" | "server";

const lanes: Record<Lane, { title: string; tool: LogoId }> = {
  user: { title: "ผู้ใช้ / เบราว์เซอร์", tool: "chrome" },
  google: { title: "Google", tool: "google" },
  server: { title: "เซิร์ฟเวอร์ (Backend)", tool: "fastify" },
};

interface Step {
  lane: Lane;
  text: string;
  /** What carries it, as drawn on the arrow into this step. */
  via?: ProtocolId;
  planned?: boolean;
}

/** Page 2 of the drawio ("User flow: Google login"). */
const happy: Step[] = [
  { lane: "user", text: "กดปุ่ม Sign in with Google" },
  { lane: "google", text: "Google ยืนยันตัวตน แล้วออก ID token", via: "oidc" },
  { lane: "user", text: "ส่ง ID token ไปที่ POST /auth/google", via: "https" },
  { lane: "server", text: "ตรวจ ID token (aud · iss · exp ด้วย JWKS) ว่าถูกต้องไหม" },
  { lane: "server", text: "หาผู้ใช้จาก googleSub หรืออีเมล ถ้าไม่พบ สร้างบัญชีใหม่" },
  { lane: "server", text: "ตรวจว่าบัญชีใช้งานได้ไหม" },
  { lane: "server", text: "ออก CMAS JWT: access 15 นาที (refresh 7 วัน ส่งเป็น cookie ตามแผน)", via: "jwt" },
  { lane: "user", text: "เก็บ access token แล้วเรียก API โดยแนบ JWT", via: "jwt" },
  { lane: "user", text: "ใช้งานตามบทบาท (RBAC)" },
];

interface Scenario {
  id: string;
  title: string;
  /** Steps shown, as an index into `happy`, and how it ends. */
  upTo: number;
  end?: string;
}

const scenarios: Scenario[] = [
  { id: "ok", title: "ล็อกอินสำเร็จ", upTo: happy.length - 1 },
  { id: "bad", title: "ID token ไม่ถูกต้อง", upTo: 3, end: "ปฏิเสธ (401): server ไม่ออก JWT ให้" },
  {
    id: "pending",
    title: "บัญชียังไม่ได้รับอนุมัติ",
    upTo: 5,
    end: "ปฏิเสธ (401) หรือแจ้งว่ารออนุมัติ: อีเมลนอกโดเมนสถาบันต้องรอ ADMIN กดอนุมัติ",
  },
];

/** Walk through Google login, including the two ways it can stop. */
export function LoginFlow() {
  const [scenarioId, setScenarioId] = useState("ok");
  const [idx, setIdx] = useState(0);
  const { mode } = useExplainMode();

  const sc = scenarios.find((s) => s.id === scenarioId)!;
  const steps = happy.slice(0, sc.upTo + 1);
  const last = steps.length - 1;
  const done = idx >= last;

  const pick = (id: string) => {
    setScenarioId(id);
    setIdx(0);
  };

  return (
    <div data-wide className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="สถานการณ์" className="flex flex-wrap gap-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === scenarioId}
            onClick={() => pick(s.id)}
            className={["btn btn--sm", s.id === scenarioId ? "btn--primary" : "btn--outlined"].join(" ")}
          >
            {s.title}
          </button>
        ))}
      </div>

      <ol className="m-0 flex list-none flex-col gap-2 p-0" aria-label="ขั้นตอนล็อกอิน">
        {steps.map((s, i) => {
          const shown = i <= idx;
          const lane = lanes[s.lane];
          const current = i === idx;
          return (
            <li key={`${scenarioId}-${i}`} className={["mt-0 transition-opacity", shown ? "opacity-100" : "opacity-30"].join(" ")}>
              {s.via && shown && (
                <p className="mb-1 ml-14 flex flex-wrap items-center gap-2 text-label font-semibold text-ink2">
                  ↓ {protocols[s.via].name}
                  {protocols[s.via].planned && <PlannedBadge />}
                </p>
              )}
              <div
                className={[
                  "flex items-start gap-3 rounded-md border px-3 py-3",
                  current ? "border-haze bg-sel-bg ring-2 ring-haze" : "border-edge bg-card",
                ].join(" ")}
              >
                <Tool id={lane.tool} size={24} label={false} />
                <div className="min-w-0 flex-1">
                  <p className="text-label font-semibold text-ink2">
                    {i + 1} · {lane.title}
                  </p>
                  <p className="text-body text-ink">{s.text}</p>
                  {mode === "detail" && s.via && shown && (
                    <p className="mt-1 text-body-sm text-ink2">{protocols[s.via].detail}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {done && sc.end && (
        <div className="alert alert--danger" role="status">
          <CircleX size={18} className="alert-icon" aria-hidden />
          <div>
            <p className="alert-title">จบที่นี่</p>
            <p className="alert-body">{sc.end}</p>
          </div>
        </div>
      )}
      {done && !sc.end && (
        <div className="alert alert--success" role="status">
          <div>
            <p className="alert-title">เข้าสู่ระบบสำเร็จ</p>
            <p className="alert-body">ผู้ใช้ได้ access token และใช้งานระบบตามสิทธิ์ของบทบาทตัวเอง</p>
          </div>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <button type="button" className="btn btn--outlined btn--sm" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
          <ChevronLeft size={16} /> ก่อนหน้า
        </button>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => setIdx((i) => Math.min(last, i + 1))} disabled={done}>
          ถัดไป <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
