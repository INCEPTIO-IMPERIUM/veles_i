import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { useExplainMode } from "@/lib/explainMode";
import { project } from "@/project.config";

interface Step {
  title: string;
  simple: string;
  command?: string;
}

const npmSteps: Step[] = [
  {
    title: "ดึงโปรเจกต์ลงมา",
    simple: "คัดลอกโค้ดทั้งหมดจาก GitHub มาไว้ในเครื่อง",
    command: `git clone ${project.repoUrl}.git\ncd CMAS-CLO`,
  },
  {
    title: "ให้สคริปต์ตั้งค่าให้",
    simple:
      "คำสั่งเดียวที่ตรวจเวอร์ชัน Node สร้างไฟล์ .env ทั้ง 3 ไฟล์ สร้างกุญแจ JWT ที่ใช้ได้ ติดตั้ง package และสร้าง Prisma client รันซ้ำได้ ไม่ทับ .env เดิม",
    command: project.commands.setup,
  },
  {
    title: "กรอกค่าในไฟล์ .env",
    simple:
      "ใส่ที่อยู่ฐานข้อมูล (ขอจากหัวหน้าทีม) รหัสแอป Google และอีเมลของคุณใน ADMIN_EMAILS ดูความหมายแต่ละตัวในตารางด้านล่าง",
  },
  {
    title: "สร้างตารางในฐานข้อมูล",
    simple: "รัน migration ทั้งหมดเพื่อให้ฐานข้อมูลมีโครงสร้างตรงกับโค้ด",
    command: "npm run db:migrate:dev",
  },
  {
    title: "ใส่ข้อมูลตัวอย่าง",
    simple: "ได้รายวิชา CLO นักศึกษา และคะแนนตัวอย่างไว้ลองใช้ รันซ้ำได้ ไม่พัง",
    command: "npm run db:seed",
  },
  {
    title: "เปิดระบบ",
    simple: `เปิดหน้าเว็บ (พอร์ต ${project.ports.client}) และ server (พอร์ต ${project.ports.server}) พร้อมกัน แล้วเข้าที่ http://localhost:${project.ports.client}`,
    command: project.commands.dev,
  },
];

const dockerSteps: Step[] = [
  {
    title: "ดึงโปรเจกต์ลงมา",
    simple: "คัดลอกโค้ดจาก GitHub มาไว้ในเครื่อง ไม่ต้องติดตั้ง Node เพราะทุกอย่างรันใน container",
    command: `git clone ${project.repoUrl}.git\ncd CMAS-CLO`,
  },
  {
    title: "คัดลอกไฟล์ตัวอย่าง .env",
    simple: "สร้างไฟล์ .env ของ server และ client จากไฟล์ตัวอย่าง",
    command: "cp app/server/.env.example app/server/.env\ncp app/client/.env.example app/client/.env",
  },
  {
    title: "กรอกค่าในไฟล์ .env",
    simple: "ใส่ที่อยู่ฐานข้อมูล Supabase และ JWT_SECRET ที่ยาว 32 ตัวอักษรขึ้นไป (ในโหมดนี้ ไม่มี npm run setup ช่วยสร้างให้)",
  },
  {
    title: "เปิด container",
    simple: "ทุกคนได้ Node เวอร์ชันเดียวกัน และแก้โค้ดแล้วหน้าเว็บอัปเดตเองเหมือนเดิม",
    command: "docker compose up",
  },
  {
    title: "สร้างตารางในฐานข้อมูล (ถ้ายังไม่เคย)",
    simple: "สั่ง migration จากข้างใน container ของ server",
    command: "docker compose exec server npm run db:migrate:dev",
  },
];

const paths = [
  { id: "npm", title: "ติดตั้งในเครื่องเอง", hint: "ต้องมี Node 24+ และ npm 10+", steps: npmSteps },
  { id: "docker", title: "ใช้ Docker", hint: "ต้องมี Docker เท่านั้น", steps: dockerSteps },
] as const;

/** Two ways to get the project running, shown as numbered steps. */
export function SetupPath() {
  const [pathId, setPathId] = useState<(typeof paths)[number]["id"]>("npm");
  const { mode } = useExplainMode();
  const path = paths.find((p) => p.id === pathId)!;

  return (
    <div data-wide className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="วิธีรัน" className="grid gap-2 sm:grid-cols-2">
        {paths.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={p.id === pathId}
            onClick={() => setPathId(p.id)}
            className={[
              "rounded-md border px-4 py-3 text-left transition-colors",
              p.id === pathId ? "border-haze bg-sel-bg ring-2 ring-haze" : "border-edge bg-card hover:border-dim",
            ].join(" ")}
          >
            <span className="block text-body font-semibold text-ink">{p.title}</span>
            <span className="block text-body-sm text-ink2">{p.hint}</span>
          </button>
        ))}
      </div>

      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {path.steps.map((s, i) => (
          <li key={`${path.id}-${s.title}`} className="card card--flat mt-0 flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-label font-semibold text-card">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="card-title">{s.title}</p>
              <p className="text-body-sm text-ink2">{s.simple}</p>
              {mode === "detail" && s.command && (
                <div className="mt-3">
                  <CodeBlock code={s.command} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {mode === "simple" && (
        <p className="text-body-sm text-ink2">อยากเห็นคำสั่งจริงของแต่ละขั้น กด "แบบละเอียด" ที่แถบด้านบน</p>
      )}
    </div>
  );
}
