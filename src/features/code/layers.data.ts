/**
 * The four server layers of CMAS (Fastify). Source: docs/markdown/rule/code-rule.md §3
 * and app/server/src/modules/README.md. Every endpoint passes through them in order.
 */
export type LayerId = "route" | "controller" | "service" | "repository" | "db";

export interface Layer {
  id: LayerId;
  title: string;
  /** File name pattern. */
  file: string;
  /** Everyday comparison for non-developers. */
  analogy: string;
  /** What one request does in this layer. */
  journey: string;
  does: string[];
  never: string[];
  sample: string;
}

export const layers: Layer[] = [
  {
    id: "route",
    title: "Route",
    file: "clos.route.ts",
    analogy: "ป้ายบอกทางหน้าร้าน บอกว่าคำขอแบบไหนไปทางไหน และใครเข้าได้",
    journey: "รับคำขอ GET /courses/c1/clos ตรวจว่าผู้ถามมีสิทธิ์ แล้วส่งต่อให้ controller",
    does: [
      "ลงทะเบียน path กับ method",
      "ประกาศ config: { access } ทุก route: \"public\", \"authenticated\" หรือ { cap }",
    ],
    never: ["ห้ามมี logic", "ห้ามเขียนตรวจสิทธิ์เอง (ระบบ access ตรวจให้) ถ้าไม่ประกาศ access เซิร์ฟเวอร์จะไม่ยอมเปิด"],
    sample: `// modules/clos/clos.route.ts : เส้นทางกับสิทธิ์เท่านั้น
app.get(
  "/courses/:courseId/clos",
  { config: { access: { cap: "..." } } }, // สิทธิ์จาก authorization/capabilities.ts
  controller.list,
)`,
  },
  {
    id: "controller",
    title: "Controller",
    file: "clos.controller.ts",
    analogy: "พนักงานรับออเดอร์ รับคำสั่งแล้วส่งเข้าครัว ไม่ลงมือปรุงเอง",
    journey: "แกะ courseId จาก URL ตรวจรูปแบบข้อมูลด้วย Zod แล้วเรียก service ตัวเดียว",
    does: [
      "ตรวจ input ด้วย schema จาก clos.validator.ts",
      "เรียก service หนึ่งตัว",
      "ตอบกลับด้วย ok / created / notFound จาก lib/response.ts",
    ],
    never: [
      "ห้ามมี business logic",
      "ห้าม import prisma หรือ repository",
      "ห้ามจับ ZodError เอง ให้โยนต่อไปที่ error-handler",
    ],
    sample: `// modules/clos/clos.controller.ts : ผอมมาก
export class CloController {
  constructor(private readonly service: CloService) {}

  list = async (req: FastifyRequest<{ Params: { courseId: string } }>, reply: FastifyReply) => {
    return ok(reply, await this.service.listByCourse(req.params.courseId))
  }
}`,
  },
  {
    id: "service",
    title: "Service",
    file: "clos.service.ts",
    analogy: "พ่อครัว กฎและขั้นตอนทั้งหมดอยู่ที่นี่ ต้องการวัตถุดิบก็ให้ลูกมือไปหยิบ",
    journey: "ตัดสินใจตามกฎของระบบ เช่น ผู้ใช้เห็นรายวิชานี้ไหม แล้วขอข้อมูลจาก repository",
    does: [
      "เก็บ business rule ทั้งหมด (คำนวณ ตรวจเงื่อนไข จัดลำดับ)",
      "เรียก repository ได้หลายตัว",
      "รับ dependency ผ่าน constructor",
    ],
    never: [
      "ห้ามเรียก prisma.* ตรงๆ",
      "ห้ามรู้จัก FastifyRequest / FastifyReply",
      "ห้ามทำหลายหน้าที่ในคลาสเดียว (คำนวณคะแนน ส่งอีเมล ส่งออก Excel แยกเป็นคนละ class)",
    ],
    sample: `// modules/clos/clos.service.ts : กฎธุรกิจ
export class CloService {
  constructor(private readonly cloRepo: CloRepository) {}

  async listByCourse(courseId: string) {
    const clos = await this.cloRepo.listByCourse(courseId)
    // กฎต่างๆ อยู่ตรงนี้ เช่น เรียงลำดับ คำนวณ ตรวจเงื่อนไข
    return clos
  }
}`,
  },
  {
    id: "repository",
    title: "Repository",
    file: "clo.repository.ts",
    analogy: "คนดูแลคลัง ไปหยิบของมาให้ตามที่สั่ง ไม่ตัดสินใจอะไรเอง",
    journey: "แปลงคำขอเป็น query ของ Prisma คืนข้อมูลดิบกลับขึ้นไป",
    does: ["คุยกับ Prisma เท่านั้น", "คืนข้อมูลดิบ", "ตั้งชื่อตาม model เอกพจน์ (clo, course)"],
    never: ["ห้ามมี business rule", "ห้ามรู้เรื่อง request หรือ response"],
    sample: `// modules/clos/clo.repository.ts : คุยกับ DB อย่างเดียว
export class CloRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listByCourse(courseId: string) {
    return this.prisma.cLO.findMany({ where: { courseId } })
  }
}`,
  },
  {
    id: "db",
    title: "Prisma → PostgreSQL",
    file: "db/prisma.ts",
    analogy: "ตัวคลังข้อมูลเอง",
    journey: "ส่ง SQL ไปที่ PostgreSQL (Supabase) แล้วคำตอบเดินกลับขึ้นไปตามทางเดิม",
    does: ["PrismaClient ตัวเดียวของทั้งระบบ (singleton) ใช้ใน *.repository.ts", "โครงสร้างตารางอยู่ใน database/schema.prisma"],
    never: ["ห้ามเรียกจาก service หรือ controller โดยตรง"],
    sample: `// ทุกชั้นเดินทางตามนี้ ห้ามข้ามชั้น
Route → Controller → Service → Repository → Prisma → PostgreSQL`,
  },
];

export interface SortItem {
  /** What the reader sees: a description or a code line. */
  text: string;
  code?: boolean;
  answer: Exclude<LayerId, "db">;
  why: string;
}

export const sortItems: SortItem[] = [
  {
    text: 'prisma.cLO.findMany({ where: { courseId } })',
    code: true,
    answer: "repository",
    why: "คุยกับฐานข้อมูลตรงๆ และคืนข้อมูลดิบ นี่คืองานของ repository ที่เดียว",
  },
  {
    text: "ประกาศว่า GET /courses/:courseId/clos เรียกใช้ได้เมื่อมีสิทธิ์อะไร",
    answer: "route",
    why: "ทางเข้ากับสิทธิ์ (config: { access }) ประกาศที่ route เท่านั้น",
  },
  {
    text: "return ok(reply, data)",
    code: true,
    answer: "controller",
    why: "ส่งคำตอบกลับด้วย response helper เป็นงานของ controller",
  },
  {
    text: "ตรวจว่า body ที่ส่งมามี name และ weight ตรงตาม schema ของ Zod",
    answer: "controller",
    why: "controller ตรวจ input ด้วย schema จาก validator แล้วปล่อย ZodError ให้ error-handler แปลงเป็น 400",
  },
  {
    text: "ถ้านักศึกษาผ่าน CLO ต่ำกว่าเกณฑ์ ให้ถือว่าเป็นนักศึกษาเสี่ยง",
    answer: "service",
    why: "นี่คือกฎของระบบ (business rule) ซึ่งทั้งหมดอยู่ใน service",
  },
  {
    text: "ไม่ให้สร้าง CLO เกินจำนวนสูงสุดที่รายวิชากำหนด",
    answer: "service",
    why: "เงื่อนไขทางธุรกิจ ไม่ใช่เรื่องรับ-ส่งข้อมูล และไม่ใช่เรื่องคุยกับฐานข้อมูล",
  },
  {
    text: "บันทึกคะแนนที่คำนวณเสร็จแล้วลงตาราง Score",
    answer: "repository",
    why: "service คำนวณและตัดสินใจ ส่วนการเขียนลงตารางเป็นงานของ repository",
  },
  {
    text: "เปลี่ยน path จาก /clos เป็น /learning-outcomes",
    answer: "route",
    why: "path ถูกลงทะเบียนที่ route ที่เดียว controller และ service ไม่รู้ว่า URL คืออะไร",
  },
];
