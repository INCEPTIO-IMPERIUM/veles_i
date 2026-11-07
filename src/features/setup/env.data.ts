/**
 * Environment variables of CMAS. Sources: app/server/.env.example, app/client/.env.example,
 * database/.env.example, docs/markdown/rule/security-rule.md §1.
 */
export type EnvFile = "database" | "server" | "client";

export interface EnvVar {
  name: string;
  files: EnvFile[];
  /** Must never be committed or shared in chat. */
  secret: boolean;
  simple: string;
  example: string;
  note?: string;
}

export const fileLabels: Record<EnvFile, string> = {
  database: "database/.env",
  server: "app/server/.env",
  client: "app/client/.env",
};

export const envVars: EnvVar[] = [
  {
    name: "DATABASE_URL",
    files: ["database", "server"],
    secret: true,
    simple: "ที่อยู่ของฐานข้อมูลพร้อมรหัสผ่าน ระบบใช้ค่านี้ต่อเข้าฐานข้อมูล (Supabase)",
    example: "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres",
    note: "ตัวนี้มีรหัสผ่านอยู่ข้างใน ขอจากหัวหน้าทีมผ่าน password manager ไม่ใช่ทางแชท",
  },
  {
    name: "DIRECT_URL",
    files: ["database", "server"],
    secret: true,
    simple: "ที่อยู่ฐานข้อมูลอีกเส้นที่ Prisma ใช้ตอนสร้างหรือเปลี่ยนโครงสร้างตาราง (migration)",
    example: "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres",
    note: "ใส่ค่าเดียวกับ DATABASE_URL ได้ในการตั้งค่าแบบตรง",
  },
  {
    name: "JWT_SECRET",
    files: ["server"],
    secret: true,
    simple: "กุญแจลับที่ใช้เซ็นบัตรผ่านเข้าระบบ (token) ถ้ากุญแจรั่ว ใครก็ปลอมบัตรได้",
    example: "[random-256-bit-string]",
    note: "ต้องยาว 32 ตัวอักษรขึ้นไป ถ้าสั้นกว่านี้ server จะไม่ยอมเปิด npm run setup สร้างให้ ส่วน production ใช้ openssl rand -base64 32 และห้ามใช้ค่าเดียวกับ dev",
  },
  {
    name: "JWT_ACCESS_EXPIRES_IN",
    files: ["server"],
    secret: false,
    simple: "บัตรผ่านใบหลักใช้ได้นานเท่าไหร่",
    example: "15m",
    note: "token ต้องมีวันหมดอายุเสมอ",
  },
  {
    name: "JWT_REFRESH_EXPIRES_IN",
    files: ["server"],
    secret: false,
    simple: "บัตรสำหรับขอบัตรใบใหม่ใช้ได้นานเท่าไหร่",
    example: "7d",
  },
  {
    name: "GOOGLE_CLIENT_ID",
    files: ["server"],
    secret: false,
    simple: "รหัสของแอปที่ลงทะเบียนไว้กับ Google เพื่อให้ล็อกอินด้วยบัญชี Google ได้",
    example: "[your-client-id].apps.googleusercontent.com",
    note: "เป็นรหัสสาธารณะ ไม่ใช่ความลับ ฝั่ง server ใช้ตรวจว่า token ที่ Google ออกให้เป็นของแอปเรา",
  },
  {
    name: "INSTITUTION_EMAIL_DOMAIN",
    files: ["server"],
    secret: false,
    simple: "อีเมลที่ลงท้ายด้วยโดเมนนี้ จะได้เป็นอาจารย์ (INSTRUCTOR) ทันที คนอื่นต้องรอ admin อนุมัติ",
    example: "kmitl.ac.th",
  },
  {
    name: "ADMIN_EMAILS",
    files: ["server"],
    secret: false,
    simple: "รายชื่ออีเมล (คั่นด้วย ,) ที่จะได้เป็น ADMIN ตอนล็อกอินด้วย Google ครั้งแรก ใช้สร้าง admin คนแรก",
    example: "you@example.com",
    note: "ลบอีเมลออกทีหลังจะไม่ลดสิทธิ์ ต้องเปลี่ยน role ด้วยมือ",
  },
  {
    name: "NODE_ENV",
    files: ["server"],
    secret: false,
    simple: "บอกว่าตอนนี้รันแบบไหน: development (เครื่องเรา) หรือ production (ใช้งานจริง)",
    example: "development",
    note: "ถ้าเป็น production ระบบจะไม่เผย stack trace และ db:seed จะปฏิเสธการรัน",
  },
  {
    name: "PORT",
    files: ["server"],
    secret: false,
    simple: "ประตูที่ server เปิดรับคำขอ",
    example: "3001",
  },
  {
    name: "CORS_ORIGIN",
    files: ["server"],
    secret: false,
    simple: "เว็บไหนบ้างที่ได้รับอนุญาตให้เรียก server นี้",
    example: "http://localhost:5173",
    note: "production ต้องใส่โดเมนจริงของหน้าเว็บ ห้ามตั้งเป็น *",
  },
  {
    name: "RATE_LIMIT_MAX",
    files: ["server"],
    secret: false,
    simple: "ผู้ใช้หนึ่งคนเรียกได้กี่ครั้งต่อช่วงเวลา กันคนรัวขอเพื่อเดารหัสหรือทำให้ระบบล่ม",
    example: "100",
  },
  {
    name: "RATE_LIMIT_WINDOW",
    files: ["server"],
    secret: false,
    simple: "ช่วงเวลาที่ใช้นับ RATE_LIMIT_MAX",
    example: "1 minute",
  },
  {
    name: "VITE_API_URL",
    files: ["client"],
    secret: false,
    simple: "ที่อยู่ server ที่หน้าเว็บจะเรียก",
    example: "http://localhost:3001",
  },
  {
    name: "VITE_APP_NAME",
    files: ["client"],
    secret: false,
    simple: "ชื่อระบบที่แสดงบนหน้าเว็บ",
    example: "CLO System",
  },
  {
    name: "VITE_GOOGLE_CLIENT_ID",
    files: ["client"],
    secret: false,
    simple: "รหัสแอป Google ตัวเดียวกับ GOOGLE_CLIENT_ID ฝั่ง server",
    example: "[your-client-id].apps.googleusercontent.com",
    note: "ทุกตัวที่ขึ้นต้นด้วย VITE_ จะถูกส่งไปอยู่ในเบราว์เซอร์ของผู้ใช้ทุกคน จึงห้ามใส่ความลับ",
  },
];
