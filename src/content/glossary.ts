/**
 * Glossary. `simple` is for someone who has never coded: one or two
 * sentences, an everyday comparison where it helps. `detail` adds the
 * technical meaning. Use <Term id="..."> in any page to show a tooltip.
 */
export type GlossaryCategory = "git" | "code" | "ci" | "data" | "general";

export interface GlossaryTerm {
  id: string;
  term: string;
  category: GlossaryCategory;
  simple: string;
  detail?: string;
  /** Section id that explains this further. */
  see?: string;
}

export const categoryLabels: Record<GlossaryCategory, string> = {
  git: "Git",
  code: "โค้ด",
  ci: "CI/CD",
  data: "ข้อมูล",
  general: "ทั่วไป",
};

export const glossary: GlossaryTerm[] = [
  // ── Git ──
  {
    id: "repository",
    term: "Repository (repo)",
    category: "git",
    simple: "โฟลเดอร์ของโปรเจกต์ที่จำประวัติการแก้ไขทุกครั้งไว้ เหมือนไฟล์ Google Docs ที่ย้อนดูเวอร์ชันเก่าได้",
    detail: "ที่เก็บโค้ดพร้อมประวัติทั้งหมดที่ Git จัดการ มีทั้งสำเนาในเครื่อง (local) และบนเซิร์ฟเวอร์ เช่น GitHub (remote)",
    see: "git",
  },
  {
    id: "commit",
    term: "Commit",
    category: "git",
    simple: "การกด \"บันทึก\" งานพร้อมเขียนโน้ตสั้นๆ ว่าแก้อะไรไป ย้อนกลับมาจุดนี้ได้เสมอ",
    detail: "snapshot ของไฟล์ ณ เวลาหนึ่ง มีข้อความอธิบาย ผู้เขียน และ id ที่ไม่ซ้ำ ทีมใช้รูปแบบ type: คำอธิบาย เช่น feat: เพิ่มหน้า CLO",
    see: "git",
  },
  {
    id: "branch",
    term: "Branch",
    category: "git",
    simple: "สำเนาของงานที่แยกออกมาทำเรื่องหนึ่งโดยไม่กวนคนอื่น ทำเสร็จแล้วค่อยรวมกลับ",
    detail: "เส้นประวัติ commit ที่แยกออกจากเส้นหลัก ทีมแตกทุก branch จาก develop และตั้งชื่อตามประเภทงาน เช่น feature/clo-import",
    see: "git",
  },
  {
    id: "merge",
    term: "Merge",
    category: "git",
    simple: "การรวมงานจาก branch หนึ่งเข้าไปอีก branch หนึ่ง",
    detail: "รวมประวัติสองเส้นเข้าด้วยกัน ทีมใช้ merge commit เสมอ ไม่ใช้ squash หรือ rebase เพื่อให้เห็นว่างานแต่ละก้อนมาจาก branch ไหน",
    see: "git",
  },
  {
    id: "conflict",
    term: "Merge conflict",
    category: "git",
    simple: "เกิดเมื่อสองคนแก้บรรทัดเดียวกัน Git ไม่รู้ว่าจะเชื่อใคร เลยให้คนมาเลือกเอง",
    detail: "Git จะใส่เครื่องหมาย <<<<<<< ======= >>>>>>> ในไฟล์ ให้เลือกหรือรวมสองฝั่ง ลบเครื่องหมายออก แล้ว commit ใหม่",
    see: "git",
  },
  {
    id: "pull-request",
    term: "Pull Request (PR)",
    category: "git",
    simple: "คำขอว่า \"ช่วยดูงานนี้แล้วรวมเข้าไปให้หน่อย\" เพื่อนในทีมจะอ่านและอนุมัติก่อน",
    detail: "หน้าบน GitHub ที่แสดงความต่างระหว่าง branch ของเรากับ develop ต้องมี approval 1 คน และ CI ต้องผ่านก่อน merge",
    see: "review",
  },
  {
    id: "push-pull",
    term: "Push / Pull",
    category: "git",
    simple: "Push คือส่งงานจากเครื่องเราขึ้นไปเก็บบน GitHub ส่วน Pull คือดึงงานล่าสุดจาก GitHub ลงมาที่เครื่อง",
    see: "git",
  },
  {
    id: "git-flow",
    term: "Git Flow",
    category: "git",
    simple: "กติกาว่า branch ไหนใช้ทำอะไร เพื่อให้ของที่ใช้งานจริงไม่พังเพราะงานที่ยังไม่เสร็จ",
    detail: "develop เป็นที่รวมงานประจำวัน main เก็บเฉพาะเวอร์ชันที่ปล่อยจริง และรับได้แค่ release/* กับ hotfix/*",
    see: "git",
  },
  {
    id: "hotfix",
    term: "Hotfix",
    category: "git",
    simple: "การแก้บั๊กด่วนในเวอร์ชันที่คนใช้งานอยู่ โดยไม่ต้องรองานอื่น",
    detail: "แตกจาก main แก้ แล้วเปิด PR เข้า main ติด tag จากนั้นต้อง back-merge เข้า develop ด้วย ไม่งั้นบั๊กจะกลับมา",
    see: "git",
  },
  {
    id: "tag",
    term: "Tag",
    category: "git",
    simple: "ป้ายชื่อเวอร์ชันที่ติดไว้บนงาน เช่น v1.0.1 เพื่อย้อนกลับมาหาเวอร์ชันนั้นได้ง่าย",
    detail: "ทุก commit บน main มี tag เวอร์ชัน แก้บั๊กเพิ่มเลขท้าย (1.0.0 → 1.0.1) ออกเวอร์ชันใหม่เพิ่มเลขกลาง (1.1.0 → 1.2.0)",
    see: "git",
  },
  {
    id: "back-merge",
    term: "Back-merge",
    category: "git",
    simple: "การส่งงานที่แก้บน main กลับไปให้ develop ด้วย เพื่อให้สองฝั่งตรงกัน ไม่งั้นบั๊กที่แก้แล้วจะกลับมา",
    detail: "ทำผ่าน PR ทุกครั้ง หลัง hotfix และ release ใช้ merge commit ห้าม squash",
    see: "git",
  },
  {
    id: "squash",
    term: "Squash",
    category: "git",
    simple: "การยุบหลาย commit ให้เหลือก้อนเดียวตอน merge ทีมนี้ไม่ใช้ เพราะทำให้ประวัติหาย",
    detail: "ห้ามใช้โดยเฉพาะกับ PR ที่เข้า main และ back-merge เพราะ main กับ develop จะมีประวัติคนละสาย",
    see: "git",
  },
  {
    id: "force-push",
    term: "Force push",
    category: "git",
    simple: "การบังคับส่งงานทับของเดิมบน GitHub อาจลบงานของเพื่อนหายได้",
    detail: "git push --force ห้ามใช้บน branch ที่ใช้ร่วมกัน (main, develop) เด็ดขาด และ ruleset บล็อกให้อยู่แล้ว",
    see: "git",
  },
  // ── Code ──
  {
    id: "frontend",
    term: "Frontend (client)",
    category: "code",
    simple: "ส่วนที่ผู้ใช้เห็นและกดได้บนหน้าจอ เหมือนหน้าร้าน",
    detail: "แอปที่รันในเบราว์เซอร์ เขียนด้วย React + TypeScript และเรียกข้อมูลจาก backend ผ่าน API",
    see: "stack",
  },
  {
    id: "backend",
    term: "Backend (server)",
    category: "code",
    simple: "ส่วนหลังบ้านที่ผู้ใช้มองไม่เห็น คอยรับคำขอ ตรวจสิทธิ์ และอ่าน/เขียนข้อมูล เหมือนห้องครัวของร้าน",
    detail: "เซิร์ฟเวอร์ Fastify ที่เปิด API ตรวจ input ด้วย Zod และคุยกับฐานข้อมูลผ่าน Prisma",
    see: "stack",
  },
  {
    id: "api",
    term: "API",
    category: "code",
    simple: "ช่องทางที่หน้าบ้านใช้สั่งงานหลังบ้าน เหมือนพนักงานรับออเดอร์ที่ส่งต่อให้ครัว",
    detail: "ชุดของ URL (endpoint) ที่รับคำขอแบบ HTTP เช่น GET /courses/:id แล้วตอบกลับเป็น JSON",
    see: "code",
  },
  {
    id: "layer",
    term: "Layer (ชั้นของโค้ด)",
    category: "code",
    simple: "การแบ่งโค้ดเป็นชั้นๆ แต่ละชั้นทำหน้าที่เดียว เหมือนสายพานในโรงงาน",
    detail: "Route → Controller → Service → Repository ชั้นบนเรียกได้แค่ชั้นถัดลงไป Service ห้ามเรียกฐานข้อมูลตรง",
    see: "code",
  },
  {
    id: "typescript",
    term: "TypeScript",
    category: "code",
    simple: "JavaScript ที่บังคับให้บอกชนิดของข้อมูล ช่วยจับความผิดพลาดก่อนรันจริง",
    detail: "เปิด strict mode และห้ามใช้ any เพื่อให้ตัวตรวจ (typecheck) จับข้อผิดพลาดได้มากที่สุด",
    see: "stack",
  },
  {
    id: "validation",
    term: "Validation",
    category: "code",
    simple: "การตรวจว่าข้อมูลที่ผู้ใช้ส่งมาถูกรูปแบบก่อนนำไปใช้ เช่น อีเมลต้องมี @",
    detail: "ฝั่ง server ตรวจทุก input ด้วย Zod ส่วนไฟล์ Excel ที่อัปโหลดจะตรวจทีละแถว",
    see: "security",
  },
  {
    id: "environment-variable",
    term: "Environment variable (.env)",
    category: "code",
    simple: "ค่าตั้งค่าที่เก็บแยกจากโค้ด เช่น รหัสผ่านฐานข้อมูล ห้ามอัปขึ้น GitHub",
    detail: "อ่านผ่าน process.env ไฟล์ .env อยู่ใน .gitignore และมี .env.example บอกว่าต้องมีค่าอะไรบ้าง",
    see: "security",
  },
  {
    id: "orm",
    term: "ORM (Prisma)",
    category: "data",
    simple: "ตัวกลางที่ให้โค้ดคุยกับฐานข้อมูลโดยไม่ต้องเขียน SQL เอง",
    detail: "ทีมใช้ Prisma 6 ผ่าน repository เท่านั้น และ schema อยู่ที่ database/schema.prisma",
    see: "database",
  },
  {
    id: "jwt",
    term: "JWT (token)",
    category: "code",
    simple: "บัตรผ่านดิจิทัลที่ได้หลังล็อกอิน ส่งไปกับทุกคำขอเพื่อบอกว่าเราเป็นใคร มีวันหมดอายุเสมอ",
    detail: "access token 15 นาที + refresh token 7 วัน ลงนามด้วย JWT_SECRET authMiddleware ยังอ่านแถว User จริงจากฐานข้อมูลทุกครั้ง",
    see: "security",
  },
  {
    id: "authentication",
    term: "Authentication",
    category: "code",
    simple: "การเช็กว่า \"คุณคือใคร\" เหมือนตรวจบัตรประชาชน",
    see: "security",
  },
  {
    id: "authorization",
    term: "Authorization",
    category: "code",
    simple: "การเช็กว่า \"คุณมีสิทธิ์ทำสิ่งนี้ไหม\" เหมือนมีกุญแจห้องนี้หรือเปล่า มีบัตรที่ถูกต้องไม่ได้แปลว่าเปิดได้ทุกห้อง",
    detail: "ตรวจ role และความเป็นเจ้าของ resource ทุกครั้ง ผ่าน config.access ของ route และ authorize() ที่ตอบ 404 ไม่ใช่ 403 ถ้าไม่ควรเห็นรายวิชานั้น",
    see: "security",
  },
  {
    id: "cors",
    term: "CORS",
    category: "code",
    simple: "กติกาว่าเว็บไหนบ้างมีสิทธิ์เรียก server ของเรา",
    detail: "ตั้งผ่าน CORS_ORIGIN production ต้องใส่โดเมนจริง ห้ามตั้งเป็น *",
    see: "security",
  },
  {
    id: "rate-limit",
    term: "Rate limit",
    category: "code",
    simple: "การจำกัดจำนวนคำขอต่อช่วงเวลา กันคนรัวขอเพื่อเดารหัสหรือทำให้ระบบล่ม",
    detail: "ตั้งผ่าน RATE_LIMIT_MAX / RATE_LIMIT_WINDOW และควรใช้กับ login และการอัปโหลดคะแนน",
    see: "security",
  },
  {
    id: "docker",
    term: "Docker",
    category: "general",
    simple: "การบรรจุระบบลงกล่อง ทุกเครื่องที่เปิดกล่องจะได้สภาพแวดล้อมเหมือนกัน",
    detail: "ใช้ Docker Compose รัน client และ server ตอนพัฒนา และ Dockerfile.prod สำหรับ production",
    see: "setup",
  },
  {
    id: "monorepo",
    term: "Monorepo",
    category: "general",
    simple: "การเก็บหลายแอป (หน้าเว็บ และ server) ไว้ใน repo เดียว",
    detail: "จัดการด้วย npm workspaces แต่ละแอป deploy แยกกันได้",
    see: "stack",
  },
  // ── CI/CD ──
  {
    id: "ci",
    term: "CI (Continuous Integration)",
    category: "ci",
    simple: "ระบบตรวจงานอัตโนมัติ ทุกครั้งที่ส่งงาน มันจะเช็กว่าโค้ดไม่พังก่อนให้รวม",
    detail: "GitHub Actions รัน format, lint, typecheck, test, build แบบขนาน แล้วสรุปผลที่ job เดียว",
    see: "ci",
  },
  {
    id: "ci-gate",
    term: "CI gate",
    category: "ci",
    simple: "ไฟเขียวสุดท้าย ถ้าไม่เขียว PR จะ merge ไม่ได้",
    detail: "job สุดท้ายที่รอทุก job ก่อนหน้า เป็น check เดียวที่กฎของ branch บังคับ",
    see: "ci",
  },
  {
    id: "lint",
    term: "Lint",
    category: "ci",
    simple: "ตัวตรวจคำผิดของโค้ด ชี้จุดที่น่าจะเป็นบั๊กหรือเขียนผิดกติกา",
    detail: "ESLint ตรวจตามกฎใน eslint.config ส่วน Prettier จัดรูปแบบ (ช่องว่าง, เครื่องหมาย) ให้เหมือนกันทั้งทีม",
    see: "ci",
  },
  {
    id: "test",
    term: "Test (unit / e2e)",
    category: "ci",
    simple: "โค้ดที่เขียนไว้ลองใช้โค้ดจริง เพื่อยืนยันว่ายังทำงานถูก",
    detail: "unit test (Vitest) ทดสอบฟังก์ชันทีละตัว e2e (Playwright) ทดสอบทั้งระบบผ่านเบราว์เซอร์จริง",
    see: "ci",
  },
  {
    id: "build",
    term: "Build",
    category: "ci",
    simple: "การแปลงโค้ดที่เราเขียนให้กลายเป็นไฟล์พร้อมใช้งานจริง",
    see: "ci",
  },
  {
    id: "deploy",
    term: "Deploy",
    category: "ci",
    simple: "การนำเวอร์ชันใหม่ขึ้นไปให้ผู้ใช้ใช้งานจริง",
    see: "ci",
  },
  // ── Data ──
  {
    id: "database",
    term: "Database",
    category: "data",
    simple: "ที่เก็บข้อมูลของระบบอย่างเป็นระเบียบ เหมือนตู้เอกสารที่ค้นได้เร็ว",
    detail: "PostgreSQL (โฮสต์บน Supabase) เข้าถึงผ่าน Prisma ORM",
    see: "database",
  },
  {
    id: "schema",
    term: "Schema",
    category: "data",
    simple: "แบบแปลนของฐานข้อมูล บอกว่ามีตารางอะไร แต่ละตารางเก็บอะไร",
    detail: "อยู่ในไฟล์ database/schema.prisma เป็นต้นฉบับของโครงสร้างตารางทั้งหมด",
    see: "database",
  },
  {
    id: "migration",
    term: "Migration",
    category: "data",
    simple: "ขั้นตอนเปลี่ยนโครงสร้างฐานข้อมูลที่บันทึกไว้เป็นลำดับ ทุกเครื่องเลยเปลี่ยนตามได้เหมือนกัน",
    detail: "สร้างด้วย prisma migrate ห้ามแก้หรือเปลี่ยนชื่อโฟลเดอร์ migration ที่มีอยู่ และห้ามใช้ db push",
    see: "database",
  },
  // ── General ──
  {
    id: "dependency",
    term: "Dependency (package)",
    category: "general",
    simple: "โค้ดสำเร็จรูปที่คนอื่นเขียนไว้ เรานำมาใช้แทนการเขียนเองทั้งหมด",
    detail: "ระบุใน package.json ติดตั้งด้วย npm install และล็อกเวอร์ชันไว้ใน package-lock.json",
    see: "stack",
  },
  {
    id: "terminal",
    term: "Terminal",
    category: "general",
    simple: "หน้าต่างพิมพ์คำสั่งให้คอมพิวเตอร์ทำงาน แทนการคลิกเมาส์",
    see: "setup",
  },
];

export function termById(id: string): GlossaryTerm | undefined {
  return glossary.find((t) => t.id === id);
}
