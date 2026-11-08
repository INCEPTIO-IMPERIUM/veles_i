import { useState } from "react";

/**
 * Logos and shared vocabulary for the architecture diagrams.
 * Source: CMAS docs/diagrams/architecture/CMAS-Architecture-Overview.drawio, which loads the same
 * icons from the jsDelivr CDN (devicon, MIT · simple-icons, CC0). They are loaded from there
 * too, not copied into this repo, so a missing network shows a lettered tile instead.
 */
export type LogoId =
  | "react"
  | "typescript"
  | "vite"
  | "tailwind"
  | "router"
  | "query"
  | "zustand"
  | "fetch"
  | "chrome"
  | "nodejs"
  | "fastify"
  | "zod"
  | "prisma"
  | "jose"
  | "rust"
  | "postgres"
  | "supabase"
  | "google"
  | "actions"
  | "vitest"
  | "playwright"
  | "eslint";

const dev = (path: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}`;
const si = (name: string) => `https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${name}.svg`;

const logoMap: Record<LogoId, { name: string; src?: string }> = {
  react: { name: "React", src: dev("react/react-original.svg") },
  typescript: { name: "TypeScript", src: dev("typescript/typescript-original.svg") },
  vite: { name: "Vite", src: dev("vitejs/vitejs-original.svg") },
  tailwind: { name: "Tailwind", src: dev("tailwindcss/tailwindcss-original.svg") },
  router: { name: "React Router", src: dev("reactrouter/reactrouter-original.svg") },
  query: { name: "TanStack Query", src: si("reactquery") },
  zustand: { name: "Zustand" },
  fetch: { name: "fetch (JS)", src: dev("javascript/javascript-original.svg") },
  chrome: { name: "เบราว์เซอร์", src: dev("chrome/chrome-original.svg") },
  nodejs: { name: "Node.js", src: dev("nodejs/nodejs-original.svg") },
  fastify: { name: "Fastify", src: dev("fastify/fastify-original.svg") },
  zod: { name: "Zod", src: si("zod") },
  prisma: { name: "Prisma", src: dev("prisma/prisma-original.svg") },
  jose: { name: "jose (JWT)", src: si("jsonwebtokens") },
  rust: { name: "Rust", src: dev("rust/rust-original.svg") },
  postgres: { name: "PostgreSQL", src: dev("postgresql/postgresql-original.svg") },
  supabase: { name: "Supabase", src: dev("supabase/supabase-original.svg") },
  google: { name: "Google", src: dev("google/google-original.svg") },
  actions: { name: "GitHub Actions", src: dev("githubactions/githubactions-original.svg") },
  vitest: { name: "Vitest", src: dev("vitest/vitest-original.svg") },
  playwright: { name: "Playwright", src: dev("playwright/playwright-original.svg") },
  eslint: { name: "ESLint", src: dev("eslint/eslint-original.svg") },
};

/**
 * One tool: its logo on a white tile (some logos are dark and vanish on the dark theme)
 * and its name underneath. Falls back to the first letter if the icon can't load.
 */
export function Tool({ id, size = 32, label = true }: { id: LogoId; size?: number; label?: boolean }) {
  const [failed, setFailed] = useState(false);
  const logo = logoMap[id];
  const box = size + 14;

  return (
    <span className="inline-flex w-[5.5rem] shrink-0 flex-col items-center gap-1 text-center">
      <span
        className="flex items-center justify-center rounded-sm border border-edge bg-white"
        style={{ width: box, height: box }}
        title={logo.name}
      >
        {logo.src && !failed ? (
          <img
            src={logo.src}
            alt={label ? "" : logo.name}
            width={size}
            height={size}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="text-body font-semibold text-char" aria-hidden>
            {logo.name[0]}
          </span>
        )}
      </span>
      {label && <span className="text-caption leading-tight text-ink2">{logo.name}</span>}
    </span>
  );
}

export function ToolRow({ ids, size }: { ids: LogoId[]; size?: number }) {
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2">
      {ids.map((id) => (
        <Tool key={id} id={id} size={size} />
      ))}
    </div>
  );
}

export type ProtocolId = "https" | "rest" | "jwt" | "oidc" | "sql" | "tcpTls" | "sse" | "cookie";

export interface Protocol {
  name: string;
  simple: string;
  detail: string;
  /** Drawn in the diagram but not in the code yet (checked 2026-11-08 against `develop`). */
  planned?: boolean;
}

export const protocols: Record<ProtocolId, Protocol> = {
  https: {
    name: "HTTPS",
    simple: "การส่งข้อมูลผ่านเว็บแบบเข้ารหัส เหมือนส่งจดหมายใส่ซองปิดผนึก คนกลางระหว่างทางเปิดอ่านไม่ได้",
    detail: "HTTP ที่ทำงานบน TLS production ต้องใช้ HTTPS เท่านั้น ห้าม downgrade เป็น HTTP (Vercel / Railway / Fly.io จัดการใบรับรองให้)",
  },
  rest: {
    name: "REST API · JSON",
    simple: "ภาษากลางที่หน้าเว็บใช้ขอข้อมูลจาก server ผ่าน URL เช่น GET /courses และ server ตอบเป็น JSON",
    detail: "path เป็นคำนามพหูพจน์แบบ kebab-case ไม่มีกริยา ทุกคำตอบอยู่ในรูป { success, data | message | errors } และทุก route อยู่ใต้ /api/v1",
  },
  jwt: {
    name: "JWT · Bearer token",
    simple: "บัตรผ่านดิจิทัลที่แนบไปกับทุกคำขอ บอกว่าผู้ถามคือใคร มีวันหมดอายุเสมอ",
    detail: "ส่งใน header Authorization: Bearer <token> access token อายุ 15 นาที authMiddleware ตรวจลายเซ็นด้วย jose แล้วอ่านแถว User จริงจากฐานข้อมูลทุกครั้ง",
  },
  oidc: {
    name: "OpenID Connect (ID token)",
    simple: "วิธีที่ Google ยืนยันว่าผู้ใช้คือใคร แล้วออก 'ใบรับรอง' (ID token) ให้เราไปตรวจต่อ เราไม่ต้องเก็บรหัสผ่านของผู้ใช้เอง",
    detail: "server ตรวจ ID token ที่ aud (ต้องเป็น GOOGLE_CLIENT_ID ของเรา), iss และ exp โดยใช้ชุดกุญแจสาธารณะ (JWKS) ของ Google ไม่ต้องใช้ client secret ใน flow นี้",
  },
  sql: {
    name: "SQL ผ่าน Prisma",
    simple: "ภาษาที่ใช้สั่งฐานข้อมูล Prisma แปลงโค้ด TypeScript ของเราเป็นคำสั่งนี้ให้",
    detail: "เรียกผ่าน repository เท่านั้น Prisma Client ส่งคำขอไปที่ Query Engine (เขียนด้วย Rust) ซึ่งสร้าง SQL แบบ parameterized ($1, $2) กัน SQL injection",
  },
  tcpTls: {
    name: "TCP + TLS",
    simple: "ท่อที่ server ใช้คุยกับฐานข้อมูล TCP รับประกันว่าข้อมูลไปครบตามลำดับ และ TLS เข้ารหัสไม่ให้ใครแอบอ่านระหว่างทาง",
    detail: "ต่อผ่าน DATABASE_URL ไปที่ Supabase PostgreSQL ตามแผนภาพใช้ Session pooler พอร์ต 5432 และ sslmode=require",
  },
  sse: {
    name: "Server-Sent Events (SSE)",
    simple: "ช่องทางที่ server ส่งข้อมูลใหม่ไปหาหน้าเว็บได้เองโดยไม่ต้องรอให้ถาม เหมือนมีคนมาเคาะประตูบอกข่าว",
    detail: "ในแผนภาพใช้ส่งการอัปเดตสดจาก server ไปที่หน้าเว็บ ยังไม่มีในโค้ดบน develop",
    planned: true,
  },
  cookie: {
    name: "HTTP cookie (refresh token)",
    simple: "ที่เก็บเล็กๆ ในเบราว์เซอร์ที่ใช้เก็บ 'บัตรสำหรับขอบัตรใบใหม่' ไว้แบบที่โค้ดหน้าเว็บอ่านไม่ได้",
    detail: "ตามแผนภาพ refresh token อายุ 7 วันถูกส่งเป็น cookie ปัจจุบัน env กำหนดอายุ refresh token ไว้แล้ว แต่ยังไม่พบการตั้ง cookie ในโค้ด server",
    planned: true,
  },
};

/** Small tag shown on anything drawn in the diagram but not implemented yet. */
export function PlannedBadge() {
  return (
    <span className="badge badge--warning" title="อยู่ในแผนภาพ แต่ยังไม่พบในโค้ดบน develop">
      ตามแผน
    </span>
  );
}
