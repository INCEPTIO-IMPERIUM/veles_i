/**
 * Tech stack of CMAS. Versions are read from the package.json files (the code wins over dev.md §1,
 * which is out of date about formatting, testing and CI). "Held back" notes come from dev.md §1/§8.
 */
export type StackLayer = "client" | "server" | "data" | "quality" | "delivery";

export interface Tech {
  id: string;
  name: string;
  version: string;
  layer: StackLayer;
  /** What it is, in everyday words. */
  simple: string;
  /** What it does here, technically. */
  detail: string;
  /** Held back, or a decision a newcomer would ask about. */
  decision?: string;
}

export const layerInfo: Record<StackLayer, { title: string; analogy: string }> = {
  client: { title: "หน้าบ้าน (Client)", analogy: "หน้าร้าน ที่ลูกค้าเห็นและสั่งของ" },
  server: { title: "หลังบ้าน (Server)", analogy: "ห้องครัว รับออเดอร์ ตรวจสิทธิ์ ปรุงตามกฎ" },
  data: { title: "ข้อมูล (Data)", analogy: "คลังเก็บของ และคนที่ไปหยิบของ" },
  quality: { title: "คุณภาพ (Quality)", analogy: "ผู้ตรวจคุณภาพ ก่อนของออกจากครัว" },
  delivery: { title: "ส่งมอบ (Delivery)", analogy: "การจัดส่ง และที่ตั้งร้าน" },
};

export const techs: Tech[] = [
  // ── client ──
  {
    id: "react",
    name: "React",
    version: "19",
    layer: "client",
    simple: "ตัวสร้างหน้าจอ แบ่งหน้าเป็นชิ้นเล็กๆ (component) แล้วประกอบกัน",
    detail: "SPA (ไม่ใช่ SSR) function component เท่านั้น ห้าม class component",
  },
  {
    id: "react-router",
    name: "React Router",
    version: "7",
    layer: "client",
    simple: "ตัวกำหนดว่า URL ไหนแสดงหน้าไหน",
    detail: "ตารางเส้นทางเขียนชัดเจนใน pages.config.ts (ไม่ใช่ file-based) เพิ่มหน้าใหม่ที่ไฟล์นี้",
  },
  {
    id: "vite",
    name: "Vite",
    version: "7",
    layer: "client",
    simple: "เครื่องมือเปิดหน้าเว็บตอนพัฒนา และแปลงโค้ดเป็นไฟล์จริงตอน build",
    detail: "ใช้ plugin-react-swc (SWC ไม่ใช่ Babel) เพื่อ build เร็ว",
    decision: "ค้างที่ 7 โดยตั้งใจ ทั้งที่มี 8 แล้ว ตามบันทึกเวอร์ชันของทีมใน dev.md",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    version: "4",
    layer: "client",
    simple: "จัดหน้าตาด้วยชื่อ class สั้นๆ แทนการเขียน CSS ยาวๆ",
    detail: "ผ่าน @tailwindcss/vite ไม่มี tailwind.config และไม่ต้องตั้ง content path โทเคนสีและขนาดอยู่ใน styles/",
  },
  {
    id: "shadcn",
    name: "shadcn/ui",
    version: "latest",
    layer: "client",
    simple: "ชุดปุ่ม ช่องกรอก หน้าต่างสำเร็จรูป ที่คัดลอกมาเป็นโค้ดของเราเอง",
    detail: "copy-paste ไม่ได้ติดตั้งเป็น dependency (มี components.json) แก้ได้เต็มที่",
  },
  {
    id: "tanstack",
    name: "TanStack Query",
    version: "5",
    layer: "client",
    simple: "ตัวดึงข้อมูลจาก server ที่จำผลไว้ (cache) และจัดการสถานะกำลังโหลด/ผิดพลาดให้",
    detail: "ดึงข้อมูลผ่าน hook เสมอ ห้ามใช้ useEffect + fetch ในตัว component",
  },
  {
    id: "zustand",
    name: "Zustand",
    version: "5",
    layer: "client",
    simple: "ที่เก็บสถานะที่ทุกหน้าต้องรู้ร่วมกัน",
    detail: "ใช้เก็บสถานะการล็อกอิน (auth) เท่านั้น ผ่าน persist middleware",
  },
  {
    id: "recharts",
    name: "Recharts",
    version: "3",
    layer: "client",
    simple: "ตัววาดกราฟบนแดชบอร์ด",
    detail: "แสดงผลการบรรลุ CLO และนักศึกษาที่เสี่ยง",
  },
  {
    id: "sonner",
    name: "Sonner",
    version: "2",
    layer: "client",
    simple: "กล่องแจ้งเตือนเล็กๆ ที่เด้งขึ้นมุมจอ",
    detail: "<Toaster /> ติดตั้งครั้งเดียวใน App.tsx apiClient ใช้แจ้ง error",
  },
  {
    id: "xlsx",
    name: "xlsx (SheetJS)",
    version: "0.20.3",
    layer: "client",
    simple: "ตัวอ่านและเขียนไฟล์ Excel",
    detail: "ใช้ทั้งสองฝั่ง: ฝั่ง client แสดงตัวอย่างก่อนอัปโหลด ฝั่ง server ตรวจทีละแถวจริง",
    decision: "ติดตั้งจาก cdn.sheetjs.com ไม่ใช่ npm registry เครื่องมือตรวจช่องโหว่ทั่วไปจึงมองไม่เห็น ทีมจึงมี job ตรวจเวอร์ชันตอนกลางคืน",
  },
  // ── server ──
  {
    id: "node",
    name: "Node.js",
    version: "24 LTS",
    layer: "server",
    simple: "ตัวรันโค้ด JavaScript นอกเบราว์เซอร์ หลังบ้านทำงานบนนี้",
    detail: "engines.node >= 24 กำหนดใน package.json และ .nvmrc",
  },
  {
    id: "fastify",
    name: "Fastify",
    version: "5",
    layer: "server",
    simple: "ตัวรับคำขอจากหน้าเว็บ แล้วส่งต่อให้โค้ดที่ตอบ",
    detail: "แบ่ง Route → Controller → Service → Repository (ดูหน้าโครงสร้างโค้ด) ทุก route ต้องประกาศ config.access",
  },
  {
    id: "typescript",
    name: "TypeScript",
    version: "5.9",
    layer: "server",
    simple: "JavaScript ที่บังคับบอกชนิดข้อมูล จับความผิดพลาดก่อนรันจริง",
    detail: "strict mode ห้ามใช้ any ใช้ทั้งสองฝั่ง (server ใช้ NodeNext ESM: import ต้องลงท้าย .js)",
    decision: "ค้างที่ 5.9 โดยตั้งใจ ไม่ขยับไป 7 (native compiler)",
  },
  {
    id: "zod",
    name: "Zod",
    version: "4",
    layer: "server",
    simple: "ตัวตรวจว่าข้อมูลที่ส่งมารูปแบบถูกต้องไหม ก่อนนำไปใช้",
    detail: "ตรวจ input ทุกตัวที่ validator layer และตรวจ env ตอนเริ่ม server (lib/env.ts)",
  },
  {
    id: "jose",
    name: "jose (JWT)",
    version: "6",
    layer: "server",
    simple: "ตัวสร้างและตรวจ 'บัตรผ่าน' (token) หลังล็อกอิน",
    detail: "access token 15 นาที + refresh token 7 วัน (ไม่ใช่ token ใบเดียวอายุ 30 วัน) authMiddleware อ่านแถว User จริงจากฐานข้อมูลทุกครั้ง ไม่เชื่อ role ใน token",
  },
  {
    id: "argon2",
    name: "argon2",
    version: "0.44",
    layer: "server",
    simple: "ตัวเข้ารหัสรหัสผ่านแบบที่ย้อนกลับไม่ได้",
    detail: "ห้ามเก็บรหัสผ่านตรงๆ หรือ hash เอง (MD5/SHA เปล่าๆ)",
  },
  {
    id: "fastify-plugins",
    name: "helmet · cors · rate-limit · multipart",
    version: "latest",
    layer: "server",
    simple: "ชุดเกราะป้องกัน: ใส่ header ปลอดภัย จำกัดว่าเว็บไหนเรียกได้ จำกัดจำนวนคำขอ และรับไฟล์อัปโหลด",
    detail: "multipart จำกัดไฟล์ 10MB ส่วน rate-limit ตั้งผ่าน RATE_LIMIT_MAX / RATE_LIMIT_WINDOW",
  },
  // ── data ──
  {
    id: "prisma",
    name: "Prisma",
    version: "6.19",
    layer: "data",
    simple: "ตัวกลางที่ให้โค้ดคุยกับฐานข้อมูลโดยไม่ต้องเขียน SQL เอง และดูแลประวัติการเปลี่ยนโครงสร้างตาราง",
    detail: "schema อยู่ที่ database/schema.prisma ใช้ผ่าน repository เท่านั้น",
    decision: "ค้างที่ 6.19 โดยตั้งใจ Prisma 7 ย้ายการตั้งค่า url ไป prisma.config.ts และบังคับ driver adapter ต้องวางแผนเป็นงานแยก ไม่ใช่แค่อัปเดตเลขเวอร์ชัน",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    version: "15+ (Supabase)",
    layer: "data",
    simple: "ฐานข้อมูลที่เก็บข้อมูลจริงทั้งหมด",
    detail: "โฮสต์บน Supabase ทั้ง dev และ production (ไม่มี postgres ในเครื่อง) CI ใช้ Postgres 16 ชั่วคราวที่ตายพร้อม job",
  },
  // ── quality ──
  {
    id: "vitest",
    name: "Vitest",
    version: "3",
    layer: "quality",
    simple: "ตัวรัน test ของฟังก์ชันและคลาส",
    detail: "test อยู่ข้างไฟล์ที่ทดสอบ (x.test.ts) มี coverage threshold บังคับใน CI และเป็น ratchet (ขึ้นได้ ลงไม่ได้)",
  },
  {
    id: "playwright",
    name: "Playwright",
    version: "1.64",
    layer: "quality",
    simple: "หุ่นยนต์ที่เปิดเบราว์เซอร์จริงแล้วลองใช้ระบบ",
    detail: "smoke test บน production build กับ Postgres ชั่วคราว อยู่ในโฟลเดอร์ e2e/",
  },
  {
    id: "eslint-prettier",
    name: "ESLint + Prettier",
    version: "10 / 3",
    layer: "quality",
    simple: "ESLint เตือนจุดน่าสงสัยในโค้ด ส่วน Prettier จัดรูปแบบให้ตรงกันทั้งทีม",
    detail: "npm run lint / format ใช้ flat config ทั้งสองฝั่ง Prettier ไม่แตะ docs/",
  },
  {
    id: "stryker",
    name: "Stryker",
    version: "9",
    layer: "quality",
    simple: "จงใจทำให้โค้ดผิดเล็กน้อย เพื่อดูว่า test จับได้จริงไหม",
    detail: "รันตอนกลางคืนเฉพาะ app/server/src/lib (สูตรคำนวณ) เพราะสูตรที่ผิดแล้วตัวเลขเพี้ยนแต่ยังดูถูก",
  },
  {
    id: "actions",
    name: "GitHub Actions",
    version: "—",
    layer: "quality",
    simple: "ระบบตรวจงานอัตโนมัติทุก PR",
    detail: "ci.yml (ขนาน 12 job จบที่ CI gate) และ nightly.yml (ดูหน้า CI/CD)",
  },
  // ── delivery ──
  {
    id: "npm-workspaces",
    name: "npm workspaces",
    version: "npm 10+",
    layer: "delivery",
    simple: "จัดให้หลายแอปอยู่ใน repo เดียวและติดตั้ง package ครั้งเดียว",
    detail: "app/client และ app/server เป็น workspace แยก deploy แยกกันได้",
    decision: "ใช้ npm ไม่ใช่ pnpm ตามบันทึกเวอร์ชันของทีม",
  },
  {
    id: "docker",
    name: "Docker + Compose",
    version: "latest",
    layer: "delivery",
    simple: "บรรจุระบบลงกล่อง ทุกเครื่องได้สภาพแวดล้อมเหมือนกัน",
    detail: "Dockerfile 4 ตัว (client/server × dev/prod) prod ใช้ multi-stage อ้าง base image ด้วย digest server รันเป็น non-root user และ client prod เสิร์ฟไฟล์ผ่าน nginx",
  },
  {
    id: "hosting",
    name: "Vercel · Railway / Fly.io · Supabase",
    version: "—",
    layer: "delivery",
    simple: "ที่ตั้งร้านบนอินเทอร์เน็ต: หน้าเว็บอยู่ Vercel, server อยู่ Railway หรือ Fly.io, ฐานข้อมูลอยู่ Supabase",
    detail: "แต่ละแอป deploy แยกกัน โดยตั้ง root directory เป็น app/client หรือ app/server",
    decision: "ที่ deploy ของ server ยังไม่ได้เลือก (Railway หรือ Fly.io) ขั้น CD จึงเลื่อนไว้",
  },
];
