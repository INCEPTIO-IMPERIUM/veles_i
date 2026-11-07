import {
  BookA,
  Compass,
  Database,
  FolderTree,
  GitBranch,
  GitPullRequest,
  Info,
  Layers,
  ShieldCheck,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Every page of the site, in sidebar order. The sidebar, the search box and
 * the reading paths on the Start page all read this list, so adding a page
 * means adding one entry here and one route in App.tsx.
 */
export type SectionStatus = "ready" | "soon";

export interface Section {
  id: string;
  path: string;
  title: string;
  /** One line, plain Thai. Shown on cards and in search results. */
  summary: string;
  icon: LucideIcon;
  group: "start" | "build" | "ship" | "reference";
  status: SectionStatus;
  /** Extra words that should find this page in search. */
  keywords: string[];
  /** Where the content comes from in the source project's docs. */
  sources?: string[];
}

export const sections: Section[] = [
  {
    id: "start",
    path: "/",
    title: "เริ่มที่นี่",
    summary: "เลือกบทบาทของคุณ แล้วอ่านตามลำดับที่แนะนำ",
    icon: Compass,
    group: "start",
    status: "ready",
    keywords: ["home", "หน้าแรก", "role", "บทบาท"],
  },
  {
    id: "setup",
    path: "/setup",
    title: "ตั้งค่าวันแรก",
    summary: "ติดตั้งเครื่องให้พร้อมรันโปรเจกต์ได้ภายในครึ่งชั่วโมง",
    icon: Wrench,
    group: "start",
    status: "ready",
    keywords: ["install", "ติดตั้ง", "node", "npm", "env"],
    sources: ["README.md"],
  },
  {
    id: "stack",
    path: "/stack",
    title: "Tech Stack",
    summary: "เครื่องมือแต่ละตัวในโปรเจกต์คืออะไร และใช้ทำอะไร",
    icon: Layers,
    group: "build",
    status: "ready",
    keywords: ["react", "vite", "fastify", "prisma", "postgres", "tailwind", "เทคโนโลยี"],
    sources: ["docs/markdown/graph/tech-stack.md", "docs/markdown/dev/architecture/dev.md"],
  },
  {
    id: "code",
    path: "/code",
    title: "โครงสร้างโค้ด & กฎ",
    summary: "ไฟล์แต่ละแบบอยู่ตรงไหน ตั้งชื่ออย่างไร และข้อมูลไหลผ่านชั้นไหนบ้าง",
    icon: FolderTree,
    group: "build",
    status: "ready",
    keywords: ["layer", "route", "controller", "service", "repository", "naming", "ตั้งชื่อ", "โฟลเดอร์"],
    sources: ["docs/markdown/rule/code-rule.md", "docs/markdown/dev/architecture/dev.md"],
  },
  {
    id: "git",
    path: "/git",
    title: "Git",
    summary: "แตก branch, commit, เปิด PR และแก้ conflict แบบที่ทีมตกลงกันไว้",
    icon: GitBranch,
    group: "ship",
    status: "ready",
    keywords: ["branch", "commit", "merge", "conflict", "git flow", "hotfix", "release"],
    sources: ["docs/markdown/rule/git-rule.md"],
  },
  {
    id: "review",
    path: "/review",
    title: "PR & Code Review",
    summary: "ก่อนกด merge ต้องเช็กอะไร และรีวิวงานเพื่อนอย่างไร",
    icon: GitPullRequest,
    group: "ship",
    status: "ready",
    keywords: ["pull request", "review", "approve", "checklist"],
    sources: ["docs/markdown/rule/git-rule.md §6", "docs/markdown/rule/code-rule.md §6"],
  },
  {
    id: "ci",
    path: "/ci",
    title: "CI/CD",
    summary: "ระบบตรวจงานอัตโนมัติทำอะไรบ้าง และถ้าไม่ผ่านต้องแก้อย่างไร",
    icon: Workflow,
    group: "ship",
    status: "ready",
    keywords: ["pipeline", "github actions", "ci gate", "lint", "test", "build", "deploy"],
    sources: ["docs/markdown/dev/planning/ci-cd-plan.md", ".github/workflows/ci.yml"],
  },
  {
    id: "security",
    path: "/security",
    title: "Security",
    summary: "เก็บรหัสลับอย่างไร ตรวจข้อมูลที่รับเข้ามาอย่างไร",
    icon: ShieldCheck,
    group: "ship",
    status: "ready",
    keywords: ["secret", "env", "jwt", "password", "validation", "zod", "ความปลอดภัย"],
    sources: ["docs/markdown/rule/security-rule.md"],
  },
  {
    id: "database",
    path: "/database",
    title: "Database",
    summary: "schema กับ migration คืออะไร และกฎที่ห้ามพลาด",
    icon: Database,
    group: "build",
    status: "ready",
    keywords: ["prisma", "migration", "schema", "seed", "postgres", "ฐานข้อมูล"],
    sources: ["docs/markdown/sql/migrations.md", "docs/markdown/sql/schema.md"],
  },
  {
    id: "glossary",
    path: "/glossary",
    title: "คำศัพท์",
    summary: "ศัพท์เทคนิคที่เจอบ่อย อธิบายเป็นภาษาไทยง่ายๆ",
    icon: BookA,
    group: "reference",
    status: "ready",
    keywords: ["glossary", "dictionary", "ศัพท์", "ความหมาย"],
  },
  {
    id: "about",
    path: "/about",
    title: "เกี่ยวกับ veles",
    summary: "veles คืออะไร และจะแก้เนื้อหาหรือนำไปใช้กับโปรเจกต์อื่นได้อย่างไร",
    icon: Info,
    group: "reference",
    status: "ready",
    keywords: ["about", "mdx", "แก้เนื้อหา", "contribute", "config"],
  },
];

export const groupLabels: Record<Section["group"], string> = {
  start: "เริ่มต้น",
  build: "เขียนโค้ด",
  ship: "ส่งงาน",
  reference: "อ้างอิง",
};

export function sectionById(id: string): Section | undefined {
  return sections.find((s) => s.id === id);
}

/** Reading paths on the Start page. Order matters. */
export interface Role {
  id: string;
  title: string;
  who: string;
  path: string[];
}

export const roles: Role[] = [
  {
    id: "newcomer",
    title: "มือใหม่ / ไม่ได้เขียนโค้ด",
    who: "อยากรู้ว่าโปรเจกต์ทำงานอย่างไร โดยไม่ต้องลงมือเขียนเอง",
    path: ["glossary", "stack", "git", "ci"],
  },
  {
    id: "developer",
    title: "Developer ในทีม",
    who: "ต้องรันโปรเจกต์ เขียนฟีเจอร์ และส่งงานเข้า develop",
    path: ["setup", "stack", "code", "database", "git", "ci", "security"],
  },
  {
    id: "reviewer",
    title: "Reviewer / หัวหน้าทีม",
    who: "รีวิว PR ดูแลกติกา และตัดสินใจเรื่อง release",
    path: ["code", "git", "review", "ci", "security"],
  },
];
