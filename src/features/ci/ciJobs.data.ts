/**
 * Every job of CMAS .github/workflows/ci.yml, in the order a PR shows them.
 * Written as data so the pipeline diagram and the explanations can't drift
 * apart. If ci.yml changes, change this file in the same PR.
 * Plan and status: CMAS docs/markdown/dev/planning/ci-cd-plan.md
 */
export type JobGroup = "code" | "real" | "security" | "rule";

export interface CiJob {
  /** The job key in ci.yml. */
  id: string;
  /** The check name GitHub shows on the PR. */
  name: string;
  /** Short Thai label on the chip. */
  label: string;
  group: JobGroup;
  /** One or two plain sentences, no jargon. */
  simple: string;
  /** What it really runs. */
  detail: string;
  /** Command to reproduce it on your own machine. */
  local?: string;
  /** What to do when it turns red. */
  onFail: string;
  /** Skipped when a PR only touches docs/ or .md files. */
  needsApp: boolean;
  /** Only runs on pull requests, not on push. */
  prOnly?: boolean;
  /** timeout-minutes in ci.yml. */
  minutes: number;
}

export const groupLabels: Record<JobGroup, { title: string; hint: string }> = {
  code: { title: "ตรวจโค้ด", hint: "ไม่ต้องรันระบบจริง" },
  real: { title: "รันกับของจริง", hint: "ฐานข้อมูล เบราว์เซอร์ image" },
  security: { title: "ความปลอดภัย", hint: "หาช่องโหว่และของลับที่หลุด" },
  rule: { title: "กติกาทีม", hint: "บังคับ Git Flow" },
};

export const changesJob: CiJob = {
  id: "changes",
  name: "Detect changed areas",
  label: "ดูว่าแก้อะไร",
  group: "code",
  simple: "ดูว่า PR นี้แก้ไฟล์อะไรบ้าง ถ้าแก้แค่เอกสาร ก็ข้ามงานหนักๆ ได้ จะได้ผลเร็วขึ้น",
  detail:
    "อ่านรายชื่อไฟล์จาก GitHub API โดยตรง (ไม่ใช้ action ของคนอื่น เพื่อลด dependency ที่เข้าถึง repo ได้) ถ้ามีไฟล์ที่ไม่ใช่ docs/ หรือ .md จะตั้ง app=true push และการสั่งรันเองจะรันทุกอย่างเสมอ",
  onFail: "แทบไม่ล้ม ถ้าล้มมักเป็นปัญหาเรียก API ชั่วคราว กด Re-run ได้",
  needsApp: false,
  minutes: 5,
};

export const jobs: CiJob[] = [
  {
    id: "static",
    name: "Format, lint, typecheck, API design",
    label: "ตรวจรูปแบบ",
    group: "code",
    simple:
      "ตรวจความเรียบร้อยของโค้ดโดยยังไม่ต้องรัน: จัดรูปแบบตรงกันไหม มีจุดน่าสงสัยไหม ชนิดข้อมูลถูกไหม และเอกสาร API ตรงกับโค้ดไหม",
    detail:
      "ลำดับ: npm audit signatures → db:validate (Prisma schema) → format:check (Prettier) → lint (ESLint) → typecheck (tsc) → python3 scripts/check-api-design.py",
    local: "npm run format:check\nnpm run lint\nnpm run typecheck",
    onFail:
      "format ล้ม: รัน npm run format แล้ว commit · lint ล้ม: npm run lint:fix แก้ให้ได้บางข้อ · typecheck ล้ม: แก้ชนิดข้อมูลตามที่ error บอก ห้ามใช้ any หนีปัญหา",
    needsApp: false,
    minutes: 10,
  },
  {
    id: "unit",
    name: "Unit tests + coverage",
    label: "ทดสอบฟังก์ชัน",
    group: "code",
    simple:
      "รัน test ที่ไม่ต้องใช้ฐานข้อมูล ทั้งฝั่ง client และ server แล้วเช็กว่า test ครอบคลุมโค้ดมากพอตามเกณฑ์",
    detail:
      "npm run test:unit ใช้ Vitest + coverage เกณฑ์อยู่ใน vitest.config.ts ของแต่ละฝั่ง เป็น ratchet คือขึ้นได้ ลงไม่ได้ ถ้าจะลดต้องเขียนเหตุผลใน PR ไม่รวมไฟล์ *.db.test.ts กับ isolation (ไปรันใน job db แทน จึงไม่รันซ้ำ)",
    local: "npm run test:unit",
    onFail:
      "test ล้ม: อ่านชื่อ test ที่แดง แล้วแก้โค้ด (หรือแก้ test ถ้ากติกาเปลี่ยนจริง) · coverage ต่ำกว่าเกณฑ์: เขียน test เพิ่มให้โค้ดใหม่ ไม่ใช่ลดตัวเลข",
    needsApp: true,
    minutes: 10,
  },
  {
    id: "build",
    name: "Build",
    label: "แปลงเป็นไฟล์จริง",
    group: "code",
    simple: "ลองแปลงโค้ด client และ server เป็นไฟล์พร้อมใช้งาน ถ้าแปลงไม่ได้ ก็ปล่อยของจริงไม่ได้",
    detail: "npm run build: client ใช้ tsc -b แล้ว vite build ส่วน server คอมไพล์ TypeScript",
    local: "npm run build",
    onFail:
      "อ่าน error บรรทัดแรกสุดก่อน error ที่เหลือมักตามมาจากตัวแรก ถ้าผ่านในเครื่องแต่ล้มใน CI ลอง npm run clean แล้ว build ใหม่",
    needsApp: true,
    minutes: 10,
  },
  {
    id: "db",
    name: "Migrations, drift, seed, DB + isolation tests",
    label: "ฐานข้อมูล",
    group: "real",
    simple:
      "สร้างฐานข้อมูลเปล่าชั่วคราว ลองสร้างตารางทั้งหมดตั้งแต่ต้น ใส่ข้อมูลตัวอย่างสองรอบ แล้วทดสอบว่าผู้สอนแต่ละคนเห็นเฉพาะรายวิชาของตัวเอง",
    detail:
      "Postgres 16 ที่ตายพร้อม job (CI ไม่แตะ Supabase จริงเลย) ลำดับ: db:migrate:deploy replay ทุก migration รวม 0002 ที่เขียนมือ → prisma migrate diff --exit-code จับ schema.prisma ที่แก้โดยไม่มี migration → db:seed สองรอบ (ต้อง idempotent) → test:db ทดสอบ course-scope isolation (NFR-07) ตั้ง CMAS_DB_TESTS=1 เฉพาะใน job นี้",
    local: "npm run db:migrate:deploy\nnpm run db:seed\nnpm run test:db -w app/server",
    onFail:
      "diff ขึ้นว่าขาด migration: แก้ schema.prisma แล้วลืมสร้าง ให้รัน npm run db:migrate:dev -- --name ชื่อ_snake_case · ห้ามใช้ prisma db push เพราะ SQL ที่เขียนมือจะหาย · isolation ล้ม: มี route ที่ปล่อยให้เห็นข้อมูลข้ามรายวิชา ต้องแก้ทันที · ในเครื่อง ให้ DATABASE_URL ชี้ไปฐานทดสอบที่ทิ้งได้เท่านั้น",
    needsApp: true,
    minutes: 15,
  },
  {
    id: "e2e",
    name: "E2E smoke (production build)",
    label: "ลองใช้จริง",
    group: "real",
    simple: "เปิดระบบที่ build แล้วขึ้นมาจริง ใช้เบราว์เซอร์ทดสอบว่าด่านสำคัญไม่พัง",
    detail:
      "Playwright บน production build (dist + vite preview) กับ Postgres ชั่วคราว: health, helmet, CORS, 401/403 ของ /users, หน้า login ไม่มี console error, ADMIN อนุมัติบัญชีผ่านเบราว์เซอร์ JWT secret สุ่มใหม่ทุกรอบ ไม่มี secret ใน repo ถ้าล้มจะเก็บ playwright-report ไว้ 7 วัน",
    local: "npm run build\nnpm run test:e2e",
    onFail:
      "ดาวน์โหลด artifact playwright-report จากหน้า run ของ PR ดู screenshot และ trace ว่าพังตรงขั้นไหน · DATABASE_URL ในเครื่องต้องเป็นฐานที่ทิ้งได้",
    needsApp: true,
    minutes: 15,
  },
  {
    id: "docker",
    name: "Docker build (server / client / server-dev / client-dev)",
    label: "สร้าง image ×4",
    group: "real",
    simple:
      "ลองสร้างกล่องบรรจุระบบ (image) ทั้ง 4 แบบ ว่า Dockerfile ไม่พัง และกล่องที่จะใช้จริงไม่มีช่องโหว่ร้ายแรงที่แก้ได้แล้ว",
    detail:
      "matrix 4 image แยก check และแยก cache กัน ไม่ push อะไรขึ้นไป สแกนเฉพาะคู่ prod ด้วย Grype ล้มเมื่อเจอ CRITICAL ที่มีเวอร์ชันแก้แล้ว (only-fixed) ส่วน HIGH ให้ nightly รายงาน",
    local: "docker build -f app/server/Dockerfile.prod .",
    onFail:
      "build ล้ม: ดูขั้น COPY หรือ RUN ที่แดง · scan ล้ม: อัปเดต dependency หรือ base image ตามที่ Grype ระบุ",
    needsApp: true,
    minutes: 20,
  },
  {
    id: "codeql",
    name: "CodeQL",
    label: "สแกนโค้ดเสี่ยง",
    group: "security",
    simple: "โปรแกรมของ GitHub อ่านโค้ดทั้งหมด หารูปแบบที่เสี่ยงโดนโจมตี เช่น การยัดคำสั่งแปลกปลอมเข้ามา",
    detail:
      "ภาษา javascript-typescript ผลขึ้นแท็บ Security และบน diff ของ PR การบล็อก merge ต้องตั้ง Require code scanning results ใน ruleset nightly รันโหมด security-extended เพิ่มอีกรอบ",
    onFail:
      "เปิดแท็บ Security → Code scanning อ่านว่าช่องโหว่คืออะไรและอยู่บรรทัดไหน แก้ที่ต้นเหตุ อย่ากด dismiss เพื่อให้ผ่าน",
    needsApp: true,
    minutes: 15,
  },
  {
    id: "dependency-review",
    name: "Dependency review",
    label: "ตรวจ package ใหม่",
    group: "security",
    simple: "ตรวจ package ที่ PR นี้เพิ่งเพิ่มหรืออัปเดต ว่าไม่มีช่องโหว่ร้ายแรงที่รู้กันแล้ว",
    detail: "dependency-review-action ล้มเมื่อพบระดับ high ขึ้นไป รันเฉพาะ pull_request",
    onFail: "อัปเดตเป็นเวอร์ชันที่แก้แล้ว หรือเลือก package อื่นแทน",
    needsApp: false,
    prOnly: true,
    minutes: 5,
  },
  {
    id: "secrets",
    name: "Secret scan (gitleaks)",
    label: "หาของลับหลุด",
    group: "security",
    simple: "ค้นหารหัสผ่านหรือ key ที่เผลอ commit เข้ามา",
    detail:
      "gitleaks สแกนเฉพาะ commit ที่ PR เพิ่ม (nightly สแกนทั้งประวัติ) ใช้ --redact เพื่อไม่ให้ secret โผล่ใน log ซึ่งเป็นสาธารณะ",
    onFail:
      "ถ้าเป็น secret จริง ให้ถือว่ารั่วแล้ว: เปลี่ยนค่าทันที (revoke key เดิม) แล้วค่อยลบออกจากโค้ด การลบ commit อย่างเดียวไม่พอเพราะประวัติยังอยู่ และแจ้งทีมด้วย",
    needsApp: false,
    minutes: 5,
  },
  {
    id: "workflow-lint",
    name: "Workflow security lint",
    label: "ตรวจไฟล์ CI",
    group: "security",
    simple: "ตรวจไฟล์ตั้งค่า CI เองว่าไม่เปิดช่องให้ถูกเจาะ",
    detail:
      "zizmor ตรวจ workflow และ dependabot.yml: action ที่ไม่ pin ด้วย commit SHA, สิทธิ์ token เกินจำเป็น, template injection, trigger อันตราย",
    onFail: "อ่านข้อความของ zizmor มักให้ pin action ด้วย commit SHA เต็ม หรือลดสิทธิ์ permissions ของ job",
    needsApp: false,
    minutes: 5,
  },
  {
    id: "branch-flow",
    name: "Git Flow branch rule",
    label: "กติกา branch",
    group: "rule",
    simple: "เช็กว่า PR ที่เข้า main มาจาก branch ที่อนุญาตเท่านั้น",
    detail:
      "ถ้าปลายทางเป็น main: ต้องมาจาก repo นี้เอง (ไม่ใช่ fork) และต้นทางเป็น develop, release/* หรือ hotfix/* ปลายทางอื่นผ่านเสมอ ruleset กรองตามชื่อ branch ต้นทางเองไม่ได้ จึงใช้ job นี้แทน",
    onFail: "เปิด PR เข้า main ผิด: กด Edit ข้างชื่อ PR เปลี่ยนปลายทางเป็น develop ได้เลย ไม่ต้องปิด PR",
    needsApp: false,
    prOnly: true,
    minutes: 2,
  },
];

export const gateJob: CiJob = {
  id: "gate",
  name: "CI gate",
  label: "ด่านสุดท้าย",
  group: "rule",
  simple:
    "ด่านสุดท้ายที่สรุปผลทุก job: ผ่านเมื่อทุกงานผ่านหรือถูกข้ามโดยตั้งใจ ไม่ผ่านถ้ามีงานไหนล้มหรือถูกยกเลิก",
  detail:
    "รันด้วย if: always() รอทุก job ใน needs แล้วอ่านผลจาก needs.*.result เป็น check เดียวที่ ruleset ของ main และ develop บังคับ ทำให้เพิ่มหรือข้าม job ได้โดยไม่ต้องแก้ ruleset และ PR ไม่ค้างรอ check ที่ไม่มีวันมา",
  onFail: "กดดูว่า job ไหนสีแดงแล้วแก้ที่ job นั้น ตัวมันเองไม่มีอะไรให้แก้",
  needsApp: false,
  minutes: 2,
};

export const allJobs: CiJob[] = [changesJob, ...jobs, gateJob];
