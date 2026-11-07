/**
 * Git Flow scenarios, written as data so the diagram and the step text can't drift apart.
 * Source: CMAS docs/markdown/rule/git-rule.md §1, §2, §2.1, §2.2.
 *
 * Layout: `x` is a column (0 = leftmost). `step: -1` means the commit already exists
 * before the walkthrough starts; `step: n` means it appears when step n is reached.
 * Same-lane commits are joined automatically; only cross-lane links are listed.
 */
export type LaneId = "main" | "hotfix" | "release" | "develop" | "feature" | "backmerge";

export interface Lane {
  id: LaneId;
  label: string;
  hint: string;
}

export interface Commit {
  id: string;
  lane: LaneId;
  x: number;
  step: number;
  label?: string;
  merge?: boolean;
}

export interface Link {
  from: string;
  to: string;
  step: number;
  kind: "branch" | "merge";
}

export interface Badge {
  at: string;
  text: string;
  step: number;
  tone: "tag" | "pr";
}

export interface Step {
  title: string;
  /** Plain-language version, always shown. */
  simple: string;
  /** The real rule, shown in "แบบละเอียด". */
  detail: string;
  command?: string;
  /** Commits to ring even though they are not new in this step. */
  focus?: string[];
  /** Lanes to dim (work finished). */
  fade?: LaneId[];
}

export interface Scenario {
  id: "feature" | "hotfix" | "release";
  title: string;
  blurb: string;
  lanes: Lane[];
  commits: Commit[];
  links: Link[];
  badges: Badge[];
  steps: Step[];
}

export const scenarios: Scenario[] = [
  {
    id: "feature",
    title: "ทำฟีเจอร์ใหม่",
    blurb: "งานปกติที่ทำทุกวัน ทุกอย่างเริ่มและจบที่ develop",
    lanes: [
      { id: "main", label: "main", hint: "ของที่ปล่อยแล้ว" },
      { id: "develop", label: "develop", hint: "ที่รวมงานของทีม" },
      { id: "feature", label: "feature/login-page", hint: "งานของเรา" },
    ],
    commits: [
      { id: "m0", lane: "main", x: 0, step: -1, label: "v1.0.0" },
      { id: "d0", lane: "develop", x: 1, step: -1 },
      { id: "d1", lane: "develop", x: 2, step: -1 },
      { id: "f0", lane: "feature", x: 3, step: 1 },
      { id: "f1", lane: "feature", x: 4, step: 2, label: "feat" },
      { id: "f2", lane: "feature", x: 5, step: 2, label: "feat" },
      { id: "d2", lane: "develop", x: 4, step: 3, label: "งานเพื่อน" },
      { id: "f3", lane: "feature", x: 6, step: 3, merge: true, label: "merge" },
      { id: "d3", lane: "develop", x: 7, step: 5, merge: true, label: "merge" },
    ],
    links: [
      { from: "d1", to: "f0", step: 1, kind: "branch" },
      { from: "d2", to: "f3", step: 3, kind: "merge" },
      { from: "f3", to: "d3", step: 5, kind: "merge" },
    ],
    badges: [
      { at: "f3", text: "PR", step: 4, tone: "pr" },
      { at: "d3", text: "ผ่านรีวิว", step: 5, tone: "tag" },
    ],
    steps: [
      {
        title: "อัปเดต develop ให้ล่าสุด",
        simple: "ก่อนเริ่มงานใหม่ ดึงของล่าสุดของทีมลงมาก่อน เหมือนโหลดไฟล์เวอร์ชันล่าสุดก่อนลงมือแก้",
        detail:
          "ทุก branch งานแตกจาก develop เสมอ ไม่ใช่ main ถ้าไม่ pull ก่อน จะเริ่มจากของเก่าและเสี่ยงเจอ conflict ทีหลัง",
        command: "git checkout develop\ngit pull origin develop",
        focus: ["d1"],
      },
      {
        title: "แตก branch ใหม่สำหรับงานนี้",
        simple: "ทำสำเนาไว้ทำงานของเราโดยเฉพาะ คนอื่นไม่โดนกระทบ แม้งานของเรายังไม่เสร็จ",
        detail: "1 branch ต่อ 1 งาน ตั้งชื่อพิมพ์เล็ก คั่นด้วย - ไม่เว้นวรรค ไม่ใช้ภาษาไทย",
        command: "git checkout -b feature/login-page",
      },
      {
        title: "ทำงานและ commit เป็นระยะ",
        simple: "บันทึกงานเป็นก้อนเล็กๆ พร้อมโน้ตสั้นๆ ว่าทำอะไร ถ้าพลาดก็ย้อนกลับมาจุดที่ดีได้",
        detail: "commit เล็กๆ บ่อยๆ ดีกว่าก้อนใหญ่ก้อนเดียว ข้อความใช้รูปแบบ type: คำอธิบาย",
        command: 'git add .\ngit commit -m "feat: เพิ่มฟอร์มเข้าสู่ระบบ"',
      },
      {
        title: "รวมของใหม่จาก develop เข้ามาในงานเรา",
        simple:
          "ระหว่างที่เราทำ เพื่อนอาจส่งงานเข้ามาแล้ว ดึงของเพื่อนมารวมกับของเราก่อนส่ง จะเจอปัญหาที่ตรงนี้ ไม่ใช่ตอนเพื่อนกำลังรีวิว",
        detail:
          "merge develop เข้า branch ตัวเอง ไม่ใช้ rebase กับ branch ที่เปิด PR แล้ว เพราะต้อง force push ถ้ามี conflict ให้แก้ตรงนี้",
        command:
          "git checkout develop\ngit pull origin develop\ngit checkout feature/login-page\ngit merge develop",
      },
      {
        title: "push แล้วเปิด Pull Request",
        simple: "ส่งงานขึ้น GitHub แล้วขอให้เพื่อนช่วยตรวจก่อนรวมเข้าของกลาง",
        detail:
          "PR ต้องชี้ไป develop ไม่ใช่ main · แจ้งในกลุ่มแชททุกครั้งที่เปิด PR · ห้าม push ตรงเข้า develop",
        command: "git push origin feature/login-page",
      },
      {
        title: "เพื่อนรีวิว แล้ว merge",
        simple: "เพื่อนอ่านงาน กด Approve แล้วงานของเราก็ถูกรวมเข้า develop",
        detail:
          "ต้องมี approval 1 คน (approve PR ตัวเองไม่ได้) และ check CI gate ต้องผ่าน merge แบบ merge commit ห้าม squash",
      },
      {
        title: "ลบ branch ที่ใช้เสร็จแล้ว",
        simple: "เก็บกวาดสำเนาที่ไม่ใช้แล้ว ไม่ให้ repo รก",
        detail: "ลบหลัง merge เท่านั้น งานทั้งหมดอยู่ในประวัติของ develop แล้ว",
        command: "git branch -d feature/login-page",
        fade: ["feature"],
      },
    ],
  },
  {
    id: "hotfix",
    title: "แก้บั๊กด่วน (Hotfix)",
    blurb: "บั๊กบนของที่คนใช้อยู่ แก้ตรงๆ ไม่รองานอื่น แล้วต้องพาการแก้กลับไป develop",
    lanes: [
      { id: "main", label: "main", hint: "ของที่ปล่อยแล้ว" },
      { id: "hotfix", label: "hotfix/null-check", hint: "แก้ด่วน" },
      { id: "develop", label: "develop", hint: "ที่รวมงานของทีม" },
      { id: "backmerge", label: "chore/backmerge", hint: "พากลับ develop" },
    ],
    commits: [
      { id: "m0", lane: "main", x: 1, step: -1, label: "v1.0.0" },
      { id: "d0", lane: "develop", x: 0, step: -1 },
      { id: "d1", lane: "develop", x: 2, step: -1, label: "งานใหม่" },
      { id: "h0", lane: "hotfix", x: 2, step: 1 },
      { id: "h1", lane: "hotfix", x: 3, step: 2, label: "fix" },
      { id: "m1", lane: "main", x: 4, step: 3, merge: true, label: "merge" },
      { id: "b0", lane: "backmerge", x: 5, step: 5 },
      { id: "b1", lane: "backmerge", x: 6, step: 5, merge: true, label: "merge main" },
      { id: "d2", lane: "develop", x: 7, step: 6, merge: true, label: "merge" },
    ],
    links: [
      { from: "m0", to: "h0", step: 1, kind: "branch" },
      { from: "h1", to: "m1", step: 3, kind: "merge" },
      { from: "d1", to: "b0", step: 5, kind: "branch" },
      { from: "m1", to: "b1", step: 5, kind: "merge" },
      { from: "b1", to: "d2", step: 6, kind: "merge" },
    ],
    badges: [
      { at: "m1", text: "PR", step: 3, tone: "pr" },
      { at: "m1", text: "v1.0.1", step: 4, tone: "tag" },
      { at: "d2", text: "PR", step: 6, tone: "pr" },
    ],
    steps: [
      {
        title: "เจอบั๊กบนของที่ปล่อยแล้ว",
        simple: "ผู้ใช้กำลังเจอปัญหาอยู่ตอนนี้ จะรอรอบถัดไปไม่ได้ ต้องแก้บนเวอร์ชันที่เขาใช้",
        detail:
          "hotfix ต่างจาก feature ตรงที่แตกจาก main (ไม่ใช่ develop) เพราะ develop มีงานที่ยังไม่ปล่อยปนอยู่",
        command: "git checkout main\ngit pull origin main",
        focus: ["m0"],
      },
      {
        title: "แตก hotfix จาก main",
        simple: "ทำสำเนาของเวอร์ชันที่ปล่อยแล้วมาแก้ ไม่แตะงานใหม่ที่ยังทำไม่เสร็จ",
        detail: "ตั้งชื่อ hotfix/<ชื่อบั๊ก> เป็นพิมพ์เล็กคั่นด้วย -",
        command: "git checkout -b hotfix/null-check",
      },
      {
        title: "แก้บั๊กแล้ว commit",
        simple: "แก้เฉพาะจุดที่มีปัญหา ไม่เพิ่มของอื่นแถม",
        detail: "ใช้ fix: นำหน้าข้อความ commit",
        command: 'git add .\ngit commit -m "fix: แก้บั๊กระบบชำระเงินล่ม"',
      },
      {
        title: "เปิด PR เข้า main ให้ทีมรีวิวด่วน",
        simple: "แม้จะด่วน ก็ยังต้องมีเพื่อนช่วยดูอีกคน แต่ให้บอกในกลุ่มแชททันทีว่ามีของด่วน",
        detail:
          "hotfix ยังต้องผ่าน PR เหมือนเดิม: approval 1 คน + CI gate ห้าม push ตรงเข้า main ห้ามใช้ squash",
        command: "git push origin hotfix/null-check",
      },
      {
        title: "ติด tag เวอร์ชันบน main",
        simple: "ตั้งชื่อเวอร์ชันใหม่ให้ของที่เพิ่งแก้ เพื่อให้ย้อนกลับมาหาได้ง่าย",
        detail: "ทุก commit บน main ต้องมี tag เวอร์ชัน บั๊กแก้ใช้เลข patch เพิ่ม (1.0.0 → 1.0.1)",
        command: "git checkout main\ngit pull origin main\ngit tag v1.0.1\ngit push origin v1.0.1",
      },
      {
        title: "พาการแก้กลับไปที่ develop (ห้ามลืม)",
        simple:
          "ตอนนี้ main แก้แล้ว แต่ develop ยังเป็นของเก่า ต้องส่งการแก้ไปให้ด้วย ไม่งั้นรอบหน้าบั๊กตัวเดิมจะกลับมา",
        detail: "แตก chore/backmerge-<เวอร์ชัน> จาก develop แล้ว merge main เข้าไป",
        command:
          "git checkout develop\ngit pull origin develop\ngit checkout -b chore/backmerge-v1.0.1\ngit merge main\ngit push origin chore/backmerge-v1.0.1",
      },
      {
        title: "เปิด PR เข้า develop",
        simple: "ส่งการแก้เข้ากองกลางตามขั้นตอนปกติ",
        detail:
          "PR chore/backmerge-v1.0.1 → develop ใช้ merge commit ห้าม squash ไม่งั้น main กับ develop จะมีประวัติคนละสาย แล้ว PR ถัดไปจะ conflict ซ้ำของเดิม",
        focus: ["d2"],
        fade: ["hotfix", "backmerge"],
      },
    ],
  },
  {
    id: "release",
    title: "ออกเวอร์ชันใหม่ (Release)",
    blurb: "เมื่อฟีเจอร์ของรอบนี้ครบ แช่แข็งไว้ตรวจ แล้วปล่อยขึ้น main",
    lanes: [
      { id: "main", label: "main", hint: "ของที่ปล่อยแล้ว" },
      { id: "release", label: "release/1.2.0", hint: "เตรียมออกเวอร์ชัน" },
      { id: "develop", label: "develop", hint: "ที่รวมงานของทีม" },
    ],
    commits: [
      { id: "m0", lane: "main", x: 0, step: -1, label: "v1.1.0" },
      { id: "d0", lane: "develop", x: 1, step: -1 },
      { id: "d1", lane: "develop", x: 2, step: -1, label: "ฟีเจอร์ครบ" },
      { id: "r0", lane: "release", x: 3, step: 1 },
      { id: "r1", lane: "release", x: 4, step: 2, label: "fix" },
      { id: "d2", lane: "develop", x: 4, step: 2, label: "งานรอบหน้า" },
      { id: "m1", lane: "main", x: 5, step: 3, merge: true, label: "merge" },
      { id: "d3", lane: "develop", x: 6, step: 5, merge: true, label: "merge" },
    ],
    links: [
      { from: "d1", to: "r0", step: 1, kind: "branch" },
      { from: "r1", to: "m1", step: 3, kind: "merge" },
      { from: "r1", to: "d3", step: 5, kind: "merge" },
    ],
    badges: [
      { at: "m1", text: "PR", step: 3, tone: "pr" },
      { at: "m1", text: "v1.2.0", step: 4, tone: "tag" },
      { at: "d3", text: "PR", step: 5, tone: "pr" },
    ],
    steps: [
      {
        title: "ฟีเจอร์ของรอบนี้ครบแล้ว",
        simple: "ทีมตกลงกันว่าของที่จะปล่อยรอบนี้ทำเสร็จหมดแล้ว",
        detail: "ตรวจว่า develop ล่าสุดและ CI ผ่าน ก่อนแตก release",
        command: "git checkout develop\ngit pull origin develop",
        focus: ["d1"],
      },
      {
        title: "แตก release/x.y.z จาก develop",
        simple: "แยกชุดที่จะปล่อยออกมาตรวจ ส่วนงานรอบหน้าทำต่อบน develop ได้ ไม่ต้องหยุด",
        detail: "ชื่อ release ใช้เลขเวอร์ชัน x.y.z ตรงกับ tag ที่จะติด",
        command: "git checkout -b release/1.2.0\ngit push origin release/1.2.0",
      },
      {
        title: "แก้เฉพาะบั๊กที่เจอตอนเตรียม",
        simple: "ช่วงนี้แก้ได้แค่ของที่พัง ห้ามเพิ่มของใหม่ ถ้าเพิ่มได้ จะไม่มีวันตรวจเสร็จ",
        detail:
          "บน release แก้ได้เฉพาะ fix: ห้ามเพิ่มฟีเจอร์ งานใหม่ที่ไม่ใช่บั๊กให้เข้า develop ตามปกติ (ดูในแผนผัง: develop เดินต่อได้) รอเวอร์ชันรอบหน้า",
      },
      {
        title: "เปิด PR release → main",
        simple: "ขอปล่อยของขึ้นเวอร์ชันจริง ต้องมีเพื่อนอนุมัติและ CI ผ่านก่อน",
        detail: "merge commit ห้าม squash เมื่อ CI ผ่านและมี approval 1 คน",
      },
      {
        title: "ติด tag บน main",
        simple: "ตั้งชื่อเวอร์ชันให้ของที่เพิ่งปล่อย",
        detail: "tag ต้องตรงกับเลขใน branch release",
        command: "git checkout main\ngit pull origin main\ngit tag v1.2.0\ngit push origin v1.2.0",
      },
      {
        title: "พาบั๊กที่แก้กลับ develop",
        simple: "บั๊กที่แก้ระหว่างเตรียมต้องไปอยู่ใน develop ด้วย ไม่งั้นรอบหน้าจะกลับมาอีก",
        detail: "เปิด PR release/1.2.0 → develop แบบ merge commit ห้าม squash",
        focus: ["d3"],
        fade: ["release"],
      },
    ],
  },
];
