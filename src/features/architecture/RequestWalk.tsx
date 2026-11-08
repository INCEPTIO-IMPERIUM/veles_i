import { ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { useExplainMode } from "@/lib/explainMode";
import { ToolRow, type LogoId } from "./tools";

type Phase = "frontend" | "backend" | "database" | "back";

interface Step {
  phase: Phase;
  title: string;
  file?: string;
  simple: string;
  detail: string;
  tools: LogoId[];
  code?: string;
  /** What can go wrong here, and what the caller gets. */
  fails?: string;
  /** Arrow drawn above this step. */
  via?: string;
}

const phaseLabel: Record<Phase, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  back: "ขากลับ",
};

/**
 * Page 4 of the drawio, re-checked against app/server on 2026-11-08: ADMIN approves a pending
 * user, PATCH /users/:id/approve. The drawio still calls rbac('ADMIN'); the code now uses
 * access.middleware with the `user.manage` capability, so this walk follows the code.
 */
const steps: Step[] = [
  {
    phase: "frontend",
    title: "Page: ผู้ใช้กด \"อนุมัติ\"",
    file: "features/users/Users.page.tsx",
    simple: "ADMIN กดปุ่มอนุมัติข้างชื่อผู้ใช้ที่รออยู่ หน้าเว็บสั่งให้ hook ทำงาน",
    detail: "component เรียก approve.mutate(user.id) เท่านั้น ไม่มี logic ของระบบอยู่ในหน้าจอ",
    tools: ["react", "router"],
    code: "approve.mutate(user.id)",
  },
  {
    phase: "frontend",
    title: "Hook: useUsers (mutation อนุมัติ)",
    file: "features/users/useUsers.ts",
    simple: "ตัวช่วยที่รู้วิธีส่งคำสั่งอนุมัติ และรู้ว่าเสร็จแล้วต้องรีเฟรชรายชื่อ",
    detail: "useMutation ของ TanStack Query: mutationFn = usersApi.approve(id) และตอน onSuccess จะ invalidateQueries เพื่อดึงรายชื่อใหม่",
    tools: ["query"],
    code: "useMutation({ mutationFn: (id) => usersApi.approve(id) })",
  },
  {
    phase: "frontend",
    title: "API wrapper: users.api.ts",
    file: "features/users/users.api.ts",
    simple: "บอกแค่ว่าจะเรียก path ไหน และคาดว่าจะได้ข้อมูลหน้าตาแบบไหนกลับมา",
    detail: "ระบุแค่ path และ type ไม่มีรายละเอียดเรื่อง header หรือ token",
    tools: ["typescript"],
    code: 'apiClient.patch<User>("/users/:id/approve")',
  },
  {
    phase: "frontend",
    title: "apiClient: ประกอบคำขอจริง",
    file: "lib/apiClient.ts",
    simple: "ตัวส่งคำขอกลางของทั้งเว็บ ใส่บัตรผ่าน (JWT) ที่เก็บไว้ลงไป ถ้าผิดพลาดจะเด้งแจ้งเตือนให้เอง",
    detail: "ใช้ fetch ใส่ Authorization: Bearer <token> + JSON ถ้า !res.ok จะ toast.error แล้ว throw สำเร็จแล้วคืน json.data token อ่านจาก useAuthStore (Zustand persist, localStorage ชื่อ \"clo-auth\")",
    tools: ["fetch", "zustand"],
    code: "Authorization: Bearer <JWT>",
  },
  {
    phase: "backend",
    via: "HTTPS · REST/JSON · PATCH /users/:id/approve · Authorization: Bearer <JWT>",
    title: "Fastify plugins ด่านแรก",
    file: "app.ts",
    simple: "ก่อนถึงโค้ดของเรา คำขอผ่านเกราะป้องกัน: header ปลอดภัย, ตรวจว่ามาจากเว็บที่อนุญาต, นับจำนวนคำขอ",
    detail: "helmet ใส่ security header, cors ตรวจ origin, rate-limit นับคำขอ (เกินกำหนด → 429)",
    tools: ["fastify"],
    fails: "เกินจำนวนที่กำหนด → 429",
  },
  {
    phase: "backend",
    title: "Route: จับเส้นทาง",
    file: "modules/users/users.route.ts",
    simple: "หาว่าคำขอนี้ตรงกับเส้นทางไหน และประกาศว่าเส้นทางนี้ต้องมีสิทธิ์อะไร",
    detail: "ประกอบ Controller(Service(Repository)) และกำหนด config: { access: { cap: \"user.manage\" } } ถ้าไม่ประกาศ access server จะไม่ยอมเปิด",
    tools: ["fastify"],
    code: 'app.patch("/:id/approve", { config: { access } }, controller.approve)',
  },
  {
    phase: "backend",
    title: "ตรวจตัวตนและสิทธิ์",
    file: "middlewares/access.middleware.ts · auth.middleware.ts",
    simple: "ตรวจบัตรผ่านว่าจริงไหม แล้วเช็กในฐานข้อมูลสดๆ ว่าผู้ใช้ยังใช้งานได้และมีสิทธิ์จัดการผู้ใช้ไหม",
    detail: "authMiddleware: jose jwtVerify(token) ได้ sub แล้ว prisma.user.findUnique(sub) อ่าน role และ status ใหม่ทุกครั้ง (ไม่เชื่อ role ใน token) จากนั้น authorize เทียบ role กับ capability user.manage ซึ่งเป็นของ ADMIN เท่านั้น",
    tools: ["fastify", "jose", "prisma"],
    fails: "token ผิดหรือบัญชีใช้ไม่ได้ → 401 · role ไม่มีสิทธิ์ → 403",
  },
  {
    phase: "backend",
    title: "Controller + Zod: ตรวจข้อมูลที่ส่งมา",
    file: "modules/users/users.controller.ts",
    simple: "เปิดตรวจว่า id ที่ส่งมารูปแบบถูกต้อง แล้วเรียก service ตัวเดียว",
    detail: "userIdParamsSchema.parse(req.params) ได้ { id } ถ้าผิดรูปแบบจะโยน ZodError ไปให้ error-handler แปลงเป็น 400",
    tools: ["fastify", "zod"],
    fails: "ข้อมูลผิดรูปแบบ → ZodError → 400",
  },
  {
    phase: "backend",
    title: "Service: กฎของระบบ",
    file: "modules/users/users.service.ts",
    simple: "ตัดสินใจตามกฎ: ไม่พบผู้ใช้ก็บอกว่าไม่พบ ถ้าอนุมัติไปแล้วก็ไม่ทำซ้ำ ไม่งั้นสั่งให้อนุมัติ",
    detail: "UsersService.approve(id): findById ไม่พบ → null (ตอบ 404) · สถานะ ACTIVE อยู่แล้ว → คืนค่าเดิม (ทำซ้ำได้ ไม่พัง) · ไม่ใช่ → repo.approve(id)",
    tools: ["typescript"],
    fails: "ไม่พบผู้ใช้ → 404",
  },
  {
    phase: "backend",
    title: "Repository + Prisma Client",
    file: "modules/users/user.repository.ts",
    simple: "คนเดียวที่ได้แตะตารางผู้ใช้ สั่งเปลี่ยนสถานะเป็นใช้งานได้",
    detail: "ไฟล์เดียวที่เรียก prisma.user ไม่มี business rule อยู่ในนี้",
    tools: ["prisma"],
    code: 'prisma.user.update({ where: { id }, data: { status: "ACTIVE" } })',
  },
  {
    phase: "database",
    via: "Prisma Client → Query Engine · SQL ผ่าน TCP (DATABASE_URL)",
    title: "Prisma Query Engine (Rust)",
    simple: "ตัวแปลโค้ดของเราเป็นคำสั่งฐานข้อมูล แล้วส่งไปทางท่อที่เข้ารหัส",
    detail: "รับ query จาก Prisma Client สร้าง SQL แบบ parameterized แล้วส่งผ่าน TCP ไปที่ Supabase",
    tools: ["prisma", "rust"],
  },
  {
    phase: "database",
    title: "PostgreSQL อัปเดตแถว",
    simple: "ฐานข้อมูลเปลี่ยนสถานะผู้ใช้ และมีตัวกั้นของฐานข้อมูลเองตรวจซ้ำอีกชั้น",
    detail: "UPDATE \"User\" SET status='ACTIVE' WHERE id=$1 มี CHECK constraint และ trigger ตรวจซ้ำ (จาก migration ที่เขียนมือ) ต่อให้โค้ดชั้นบนพลาด ข้อมูลผิดกฎก็เข้าไม่ได้",
    tools: ["postgres", "supabase"],
    code: "UPDATE \"User\" SET status = 'ACTIVE' WHERE id = $1",
  },
  {
    phase: "back",
    via: "แถวที่อัปเดต → User (มี type)",
    title: "ตอบกลับ: ok(reply, user)",
    file: "lib/response.ts · error-handler.middleware.ts",
    simple: "ข้อมูลเดินกลับขึ้นไปตามทางเดิม server ตอบรูปแบบเดียวกันทุกครั้ง",
    detail: "สำเร็จ: 200 { success: true, data } ผิดพลาด: error-handler แปลง ZodError → 400, Prisma P2002 → conflict (ข้อมูลซ้ำ), P2025 → 404 นอกนั้น → 500",
    tools: ["fastify", "zod", "prisma"],
  },
  {
    phase: "back",
    via: "HTTPS · 200 { success, data }",
    title: "หน้าเว็บรีเฟรชเอง",
    simple: "hook รู้ว่าสำเร็จแล้ว จึงดึงรายชื่อใหม่ ผู้ใช้เห็นสถานะเปลี่ยนทันที",
    detail: "onSuccess: invalidateQueries → TanStack Query refetch → React render ใหม่",
    tools: ["query", "react"],
  },
];

const phaseOrder: Phase[] = ["frontend", "backend", "database", "back"];

/** The whole trip of one request, step by step, with the tool that handles each step. */
export function RequestWalk() {
  const [idx, setIdx] = useState(0);
  const { mode } = useExplainMode();
  const step = steps[idx]!;
  const last = steps.length - 1;

  return (
    <div data-wide className="flex flex-col gap-4">
      <p className="text-body-sm text-ink2">
        ตัวอย่าง: ADMIN กดอนุมัติผู้ใช้ที่รออยู่ = <code>PATCH /users/:id/approve</code> กดแต่ละขั้น หรือกด "ถัดไป"
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <ol className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="ขั้นตอนของคำขอ">
          {steps.map((s, i) => {
            const newPhase = i === 0 || steps[i - 1]!.phase !== s.phase;
            return (
              <li key={s.title} className="mt-0">
                {newPhase && (
                  <p className="card-meta mt-3 first:mt-0">
                    {phaseOrder.indexOf(s.phase) + 1} · {phaseLabel[s.phase]}
                  </p>
                )}
                {s.via && (
                  <p className="my-1 flex items-start gap-2 pl-3 text-label text-ink2">
                    <ArrowDown size={14} className="mt-0.5 shrink-0" aria-hidden />
                    <span>{s.via}</span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-current={i === idx ? "step" : undefined}
                  className={[
                    "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                    i === idx ? "border-haze bg-sel-bg ring-2 ring-haze" : "border-edge bg-card hover:border-dim",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-label font-semibold",
                      i === idx ? "bg-ink text-card" : "bg-field text-ink2",
                    ].join(" ")}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-body text-ink">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="card card--flat order-first h-fit lg:sticky lg:top-20 lg:order-none" aria-live="polite">
          <p className="card-meta">
            ขั้น {idx + 1} จาก {steps.length} · {phaseLabel[step.phase]}
          </p>
          <p className="card-title">{step.title}</p>
          {step.file && <p className="mb-2 break-all font-mono text-caption text-ink2">{step.file}</p>}
          <p className="text-body text-ink">{step.simple}</p>
          <div className="mt-3">
            <ToolRow ids={step.tools} />
          </div>
          {step.fails && (
            <div className="alert alert--warning mt-4">
              <div>
                <p className="alert-title">ถ้าผิดพลาดตรงนี้</p>
                <p className="alert-body">{step.fails}</p>
              </div>
            </div>
          )}
          {mode === "detail" && (
            <div className="mt-4 flex flex-col gap-3 border-t border-edge pt-3">
              <p className="text-body-sm text-ink2">{step.detail}</p>
              {step.code && <CodeBlock code={step.code} />}
            </div>
          )}
          <div className="mt-4 flex justify-between gap-2">
            <button type="button" className="btn btn--outlined btn--sm" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
              <ChevronLeft size={16} /> ก่อนหน้า
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setIdx((i) => Math.min(last, i + 1))} disabled={idx === last}>
              ถัดไป <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
