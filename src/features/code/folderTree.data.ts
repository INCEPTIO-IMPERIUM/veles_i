/**
 * Folder maps of CMAS. Sources: CLAUDE.md "Layout", docs/markdown/dev/architecture/dev.md §3-4,
 * app/server/src/modules/README.md. The "clos" feature is the worked example the docs use;
 * not every file of it exists yet in CMAS.
 */
export interface TreeNode {
  name: string;
  /** Folders end with "/". */
  dir?: boolean;
  note: string;
  /** Naming rule, if the file name follows one. */
  rule?: string;
  children?: TreeNode[];
}

export interface TreeSet {
  id: string;
  title: string;
  root: TreeNode;
}

const serverFeature: TreeNode = {
  name: "modules/clos/",
  dir: true,
  note: "1 โฟลเดอร์ต่อ 1 ฟีเจอร์ รวมทุกชั้นของฝั่ง server ไว้ด้วยกัน ค้นคำว่า clos ครั้งเดียวเจอครบ",
  rule: "ชื่อโฟลเดอร์ตรงกับ features/clos/ ฝั่ง client คำต่อคำ",
  children: [
    { name: "clos.route.ts", note: "ลงทะเบียน path และ access เท่านั้น ไม่มี logic", rule: "kebab-case.route.ts" },
    { name: "clos.controller.ts", note: "รับ-ส่ง request/response เรียก service ตัวเดียว", rule: "export class CloController" },
    { name: "clos.service.ts", note: "business logic ทั้งหมดอยู่ที่นี่", rule: "export class CloService" },
    {
      name: "clo.repository.ts",
      note: "ไฟล์เดียวที่แตะ Prisma ตั้งชื่อตาม model แบบเอกพจน์",
      rule: "kebab-case.repository.ts ตามชื่อ model (clo ไม่ใช่ clos)",
    },
    { name: "clos.validator.ts", note: "Zod schema และ type ที่อนุมานได้จาก schema", rule: "kebab-case.validator.ts" },
    { name: "clos.service.test.ts", note: "test วางข้างไฟล์ที่ทดสอบ", rule: "ชื่อไฟล์ที่ทดสอบ + .test.ts" },
  ],
};

export const trees: TreeSet[] = [
  {
    id: "repo",
    title: "ทั้งโปรเจกต์",
    root: {
      name: "CMAS/",
      dir: true,
      note: "monorepo: แอปสองฝั่ง ฐานข้อมูล เอกสาร และเครื่องมือ อยู่ใน repo เดียว จัดการด้วย npm workspaces",
      children: [
        {
          name: "app/",
          dir: true,
          note: "โค้ดของแอปสองฝั่ง deploy แยกกันได้ ไม่มี dependency ข้ามกัน",
          children: [
            { name: "client/", dir: true, note: "React 19 + Vite เป็น SPA (พอร์ต 5173)" },
            { name: "server/", dir: true, note: "Fastify 5 + TypeScript (พอร์ต 3001)" },
          ],
        },
        {
          name: "database/",
          dir: true,
          note: "ทุกอย่างเกี่ยวกับฐานข้อมูลอยู่ที่นี่ ทั้งสองแอปอ้างถึงที่เดียวกัน",
          children: [
            { name: "schema.prisma", note: "ต้นฉบับของโครงสร้างตารางทั้งหมด" },
            {
              name: "migrations/",
              dir: true,
              note: "ประวัติการเปลี่ยนโครงสร้างฐานข้อมูล",
              rule: "ห้ามแก้หรือเปลี่ยนชื่อโฟลเดอร์ เพราะ Prisma บันทึกชื่อไว้ในฐานข้อมูลแล้ว",
            },
            { name: "seed.ts", note: "ใส่ข้อมูลตัวอย่าง ต้องรันซ้ำได้โดยไม่พัง (idempotent)" },
          ],
        },
        {
          name: "docs/",
          dir: true,
          note: "เอกสารทั้งหมด",
          children: [
            { name: "markdown/", dir: true, note: "ต้นฉบับเอกสาร แก้ที่นี่" },
            { name: "html/", dir: true, note: "สร้างอัตโนมัติจาก markdown", rule: "ห้ามแก้ npm run docs:build จะลบแล้วสร้างใหม่" },
          ],
        },
        { name: "e2e/", dir: true, note: "Playwright smoke test บน production build" },
        { name: "scripts/", dir: true, note: "setup.mjs และสคริปต์สร้าง/ตรวจ diagram, workbook" },
        {
          name: ".github/",
          dir: true,
          note: "ตั้งค่า GitHub",
          children: [
            { name: "workflows/ci.yml", note: "CI ที่รันทุก PR (ดูหน้า CI/CD)" },
            { name: "workflows/nightly.yml", note: "ตรวจเพิ่มเติมตี 2 ทุกคืน" },
            { name: "dependabot.yml", note: "ให้ Dependabot เปิด PR อัปเดต package เอง" },
          ],
        },
        { name: "package.json", note: "สคริปต์ระดับ root เช่น npm run dev / verify / setup" },
      ],
    },
  },
  {
    id: "server",
    title: "ฝั่ง server",
    root: {
      name: "app/server/src/",
      dir: true,
      note: "โค้ด Fastify ทั้งหมด",
      children: [
        serverFeature,
        {
          name: "middlewares/",
          dir: true,
          note: "ด่านที่คำขอผ่านก่อนถึง route",
          children: [
            { name: "auth.middleware.ts", note: "ตรวจ JWT แล้วอ่านแถว User จริงจากฐานข้อมูลทุกครั้ง", rule: "อย่า optimize ให้เชื่อ role ใน JWT" },
            { name: "access.middleware.ts", note: "อ่าน config: { access } ของ route แล้วตัดสินใจ ตอบ 404 ไม่ใช่ 403 ถ้าไม่ควรเห็นรายวิชานั้น" },
            { name: "error-handler.middleware.ts", note: "แปลง ZodError / Prisma error เป็นคำตอบรูปแบบเดียวกัน" },
          ],
        },
        {
          name: "lib/",
          dir: true,
          note: "ของใช้ร่วม ไม่ผูกกับฟีเจอร์",
          children: [
            { name: "env.ts", note: "ตรวจ environment variable ด้วย Zod ถ้าขาดจะไม่ยอมเปิดเซิร์ฟเวอร์" },
            { name: "jwt.ts", note: "สร้างและตรวจ token (jose)" },
            { name: "response.ts", note: "ok / created / notFound ... คำตอบรูปแบบเดียวกันทุก endpoint" },
          ],
        },
        { name: "db/prisma.ts", note: "PrismaClient ตัวเดียวของระบบ ใช้ใน *.repository.ts เท่านั้น" },
        { name: "modules/index.ts", note: "รวม route ของทุกฟีเจอร์เข้าด้วยกัน" },
      ],
    },
  },
  {
    id: "client",
    title: "ฝั่ง client",
    root: {
      name: "app/client/src/",
      dir: true,
      note: "โค้ด React ทั้งหมด",
      children: [
        {
          name: "features/clos/",
          dir: true,
          note: "1 โฟลเดอร์ต่อ 1 ฟีเจอร์ ชื่อตรงกับ modules/clos/ ฝั่ง server",
          children: [
            { name: "Clos.page.tsx", note: "หน้าจอหลักของฟีเจอร์", rule: "PascalCase.page.tsx" },
            { name: "CloListItem.tsx", note: "component หนึ่งตัวต่อหนึ่งไฟล์", rule: "PascalCase.tsx" },
            { name: "useClos.ts", note: "hook ดึงข้อมูลด้วย TanStack Query ห้ามใช้ useEffect ดึงข้อมูล", rule: "ขึ้นต้นด้วย use" },
            { name: "clos.api.ts", note: "ฟังก์ชันเรียก API ของ resource นี้ ผ่าน apiClient", rule: "camelCase.api.ts" },
            { name: "clos.types.ts", note: "type ของ entity นี้ ใช้ type ไม่ใช้ interface", rule: "camelCase.types.ts" },
          ],
        },
        { name: "components/", dir: true, note: "ย้ายมาที่นี่เมื่อใช้ร่วมตั้งแต่ 2 ฟีเจอร์ขึ้นไปเท่านั้น (ui/ คือ shadcn, layout/ คือโครงหน้า)" },
        { name: "hooks/", dir: true, note: "hook ที่ใช้ร่วมตั้งแต่ 2 ฟีเจอร์ขึ้นไปเท่านั้น" },
        {
          name: "lib/",
          dir: true,
          note: "ของใช้ร่วม",
          children: [
            { name: "apiClient.ts", note: "ตัวเรียก API กลาง ใส่ JWT และแจ้ง toast เมื่อ error" },
            { name: "app.constants.ts", note: "ค่าคงที่ เช่น API_URL", rule: "camelCase.constants.ts" },
          ],
        },
        { name: "styles/", dir: true, note: "tokens / base / components ของ design system" },
        { name: "pages.config.ts", note: "ตารางเส้นทางทั้งหมด เพิ่มหน้าใหม่ที่นี่ (ไม่ใช่ file-based routing)" },
      ],
    },
  },
];
