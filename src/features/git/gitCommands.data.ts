/**
 * Everyday Git commands, with where each one moves your work. Team rules come from
 * CMAS docs/markdown/rule/git-rule.md (merge, never rebase a branch with an open PR;
 * no push or force-push to main/develop; tags on main).
 */
export type Zone = "wd" | "stage" | "local" | "remote";

export const zones: Record<Zone, { title: string; sub: string }> = {
  wd: { title: "ไฟล์ที่แก้อยู่", sub: "Working directory" },
  stage: { title: "เตรียม commit", sub: "Staging area" },
  local: { title: "ประวัติในเครื่อง", sub: "Local repository" },
  remote: { title: "GitHub", sub: "Remote (origin)" },
};

export const zoneOrder: Zone[] = ["wd", "stage", "local", "remote"];

export type Group = "start" | "save" | "sync" | "branch" | "undo" | "look";

export const groupLabels: Record<Group, string> = {
  start: "เริ่มต้น",
  save: "บันทึกงาน",
  sync: "คุยกับ GitHub",
  branch: "branch และการรวม",
  undo: "ย้อน / แก้",
  look: "ดูประวัติ",
};

export type Risk = "safe" | "care" | "danger";

export const riskLabels: Record<Risk, string> = {
  safe: "ปลอดภัย",
  care: "ระวัง",
  danger: "อันตราย",
};

export interface GitCommand {
  id: string;
  group: Group;
  /** What you type. Placeholders in <angle brackets>. */
  cmd: string;
  /** Three to six words. */
  short: string;
  simple: string;
  when: string;
  /** Where the work moves: [from, to]. Absent when the command only reads. */
  flow?: [Zone, Zone];
  risk: Risk;
  caution?: string;
  /** The team's rule about this command, if it has one. */
  team?: string;
}

export const commands: GitCommand[] = [
  // ── start ──
  {
    id: "clone",
    group: "start",
    cmd: "git clone <url>",
    short: "คัดลอก repo ลงเครื่อง",
    simple: "ดึงโปรเจกต์ทั้งหมดพร้อมประวัติจาก GitHub มาไว้ในเครื่อง ได้โฟลเดอร์ใหม่ที่พร้อมทำงาน",
    when: "ครั้งแรกครั้งเดียว ตอนเริ่มทำโปรเจกต์บนเครื่องใหม่",
    flow: ["remote", "wd"],
    risk: "safe",
  },
  {
    id: "config",
    group: "start",
    cmd: 'git config --global user.name "ชื่อ"\ngit config --global user.email "you@example.com"',
    short: "บอกว่าคุณเป็นใคร",
    simple: "ตั้งชื่อและอีเมลที่จะติดไปกับทุก commit คนอื่นจะรู้ว่าใครเป็นคนแก้",
    when: "ครั้งเดียวต่อเครื่อง ก่อน commit แรก",
    risk: "safe",
  },
  {
    id: "init",
    group: "start",
    cmd: "git init",
    short: "เริ่ม repo ใหม่",
    simple: "ทำให้โฟลเดอร์ปัจจุบันกลายเป็น repo ที่ Git เริ่มจำประวัติ",
    when: "ตอนสร้างโปรเจกต์ใหม่จากศูนย์ ถ้า clone มาแล้วไม่ต้องใช้",
    flow: ["wd", "local"],
    risk: "safe",
  },
  // ── save ──
  {
    id: "status",
    group: "save",
    cmd: "git status",
    short: "ตอนนี้มีอะไรเปลี่ยน",
    simple: "บอกว่าอยู่ branch ไหน ไฟล์ไหนแก้แล้ว ไฟล์ไหนรอ commit และไฟล์ไหน Git ยังไม่รู้จัก",
    when: "บ่อยที่สุด ก่อน add ก่อน commit และทุกครั้งที่ไม่แน่ใจ",
    risk: "safe",
  },
  {
    id: "add",
    group: "save",
    cmd: "git add <ไฟล์>\ngit add .",
    short: "เลือกไฟล์ที่จะบันทึก",
    simple: "ย้ายการแก้ไขเข้าไปใน \"ตะกร้ารอบันทึก\" เลือกได้ว่าจะเอาไฟล์ไหนเข้า commit ถัดไป",
    when: "หลังแก้เสร็จเป็นก้อน ก่อน commit",
    flow: ["wd", "stage"],
    risk: "safe",
    caution: "git add . เอาทุกไฟล์ ดู git status ก่อน ไม่ให้ไฟล์ .env หรือไฟล์ขยะติดไปด้วย",
  },
  {
    id: "commit",
    group: "save",
    cmd: 'git commit -m "feat: เพิ่มฟอร์มเข้าสู่ระบบ"',
    short: "บันทึกงานพร้อมโน้ต",
    simple: "บันทึกสิ่งที่อยู่ในตะกร้าเป็นหนึ่งจุดในประวัติ ย้อนกลับมาจุดนี้ได้เสมอ",
    when: "ทุกครั้งที่ทำเสร็จหนึ่งเรื่องเล็กๆ commit เล็กบ่อยๆ ดีกว่าก้อนใหญ่ก้อนเดียว",
    flow: ["stage", "local"],
    risk: "safe",
    team: "ข้อความใช้รูปแบบ type: คำอธิบาย เช่น feat:, fix:, docs: (ดูตัวช่วยเขียน commit ในหน้านี้)",
  },
  {
    id: "diff",
    group: "save",
    cmd: "git diff\ngit diff --staged",
    short: "ดูว่าแก้อะไรไป",
    simple: "แสดงบรรทัดที่เปลี่ยน git diff ดูที่ยังไม่ add ส่วน --staged ดูที่อยู่ในตะกร้าแล้ว กำลังจะเข้า commit",
    when: "ก่อน commit เพื่อเช็กว่าไม่มีอะไรหลุดติดไป",
    risk: "safe",
  },
  {
    id: "stash",
    group: "save",
    cmd: "git stash\ngit stash pop",
    short: "พักงานไว้ชั่วคราว",
    simple: "เก็บงานที่ยังไม่เสร็จใส่ลิ้นชักไว้ก่อน ไฟล์กลับเป็นสภาพล่าสุด พอพร้อมก็ stash pop เอางานคืน",
    when: "ต้องสลับไป branch อื่นด่วน แต่งานตรงนี้ยังไม่พร้อม commit",
    risk: "care",
    caution: "ลืม stash ไว้นานๆ จะจำไม่ได้ว่าเก็บอะไร ดูรายการด้วย git stash list",
  },
  // ── sync ──
  {
    id: "fetch",
    group: "sync",
    cmd: "git fetch origin",
    short: "ดูของใหม่บน GitHub",
    simple: "ดาวน์โหลดสิ่งที่คนอื่นส่งขึ้น GitHub มาเก็บไว้ในเครื่อง แต่ยังไม่แตะไฟล์ที่คุณกำลังทำ",
    when: "อยากรู้ว่ามีอะไรใหม่ก่อนตัดสินใจรวม ปลอดภัยที่สุดในกลุ่มนี้",
    flow: ["remote", "local"],
    risk: "safe",
  },
  {
    id: "pull",
    group: "sync",
    cmd: "git pull origin develop",
    short: "ดึงของใหม่มารวมเลย",
    simple: "เท่ากับ fetch แล้วรวม (merge) ให้ทันที ไฟล์ในเครื่องจะอัปเดตตาม",
    when: "ก่อนเริ่มงานทุกครั้ง และก่อนแตก branch ใหม่",
    flow: ["remote", "wd"],
    risk: "safe",
    caution: "ถ้ามีงานที่ยังไม่ commit และชนกับของใหม่ Git จะหยุดให้ commit หรือ stash ก่อน",
    team: "กติกาทีม: pull develop ก่อนเริ่มงานทุกครั้ง ลดโอกาส conflict",
  },
  {
    id: "push",
    group: "sync",
    cmd: "git push -u origin <branch>\ngit push",
    short: "ส่งงานขึ้น GitHub",
    simple: "ส่ง commit ในเครื่องขึ้นไปบน GitHub ให้คนอื่นเห็น ครั้งแรกใส่ -u เพื่อจับคู่ branch ครั้งต่อไปพิมพ์แค่ git push",
    when: "หลัง commit และก่อนเปิด Pull Request",
    flow: ["local", "remote"],
    risk: "safe",
    team: "ห้าม push ตรงเข้า main หรือ develop (กฎของ repo บล็อกไว้) push branch ตัวเองแล้วเปิด PR",
  },
  {
    id: "push-force",
    group: "sync",
    cmd: "git push --force-with-lease",
    short: "บังคับส่งทับ",
    simple: "ส่งขึ้นไปทับประวัติบน GitHub ใช้เมื่อประวัติในเครื่องถูกเขียนใหม่ (เช่นหลัง rebase หรือ amend)",
    when: "แทบไม่ต้องใช้ ถ้าทำตามกติกาทีม",
    flow: ["local", "remote"],
    risk: "danger",
    caution: "ลบงานของคนอื่นที่ push ไว้ได้ ถ้าจำเป็นจริงให้ใช้ --force-with-lease ซึ่งจะไม่ทับถ้ามีคนอื่น push เพิ่มมา",
    team: "ห้าม force push บน main และ develop เด็ดขาด (กฎของ repo บล็อกไว้)",
  },
  {
    id: "remote",
    group: "sync",
    cmd: "git remote -v",
    short: "repo นี้ผูกกับที่ไหน",
    simple: "แสดง URL ของ GitHub ที่ push และ fetch ไป ชื่อมาตรฐานคือ origin",
    when: "สงสัยว่ากำลังส่งงานไป repo ไหน",
    risk: "safe",
  },
  // ── branch ──
  {
    id: "switch-c",
    group: "branch",
    cmd: "git switch -c feature/login-page\n# แบบเก่าที่ทำงานเหมือนกัน\ngit checkout -b feature/login-page",
    short: "สร้าง branch ใหม่",
    simple: "สร้างสำเนาแยกสำหรับงานใหม่ แล้วย้ายไปทำงานบนนั้นทันที",
    when: "ทุกครั้งที่เริ่มงานใหม่หนึ่งเรื่อง (หลัง pull develop)",
    flow: ["local", "wd"],
    risk: "safe",
    team: "แตกจาก develop เสมอ ตั้งชื่อตามประเภท เช่น feature/ fix/ docs/ (ดูตัวเช็กชื่อในหน้านี้)",
  },
  {
    id: "switch",
    group: "branch",
    cmd: "git switch develop\n# หรือ\ngit checkout develop",
    short: "ย้ายไป branch อื่น",
    simple: "สลับไปทำงานบน branch ที่มีอยู่แล้ว ไฟล์ในโฟลเดอร์จะเปลี่ยนเป็นของ branch นั้น",
    when: "ต้องการกลับไป develop หรือไปดูงาน branch อื่น",
    flow: ["local", "wd"],
    risk: "safe",
    caution: "ถ้ามีงานที่ยังไม่ commit ที่ชนกัน Git จะไม่ให้สลับ ให้ commit หรือ stash ก่อน",
  },
  {
    id: "branch",
    group: "branch",
    cmd: "git branch\ngit branch -d feature/login-page",
    short: "ดู / ลบ branch",
    simple: "git branch แสดงรายการ branch ในเครื่อง (ตัวที่มี * คือที่อยู่ตอนนี้) ส่วน -d ลบ branch ที่ merge แล้ว",
    when: "หลัง PR ถูก merge แล้ว ลบ branch ที่ใช้เสร็จ",
    risk: "safe",
  },
  {
    id: "merge",
    group: "branch",
    cmd: "git merge develop",
    short: "รวมอีก branch เข้ามา",
    simple: "รวมงานจาก branch อื่นเข้ามาใน branch ที่อยู่ตอนนี้ โดยสร้าง commit รวม (merge commit) ประวัติเดิมไม่ถูกแก้",
    when: "ก่อน push: รวม develop ล่าสุดเข้า branch ตัวเอง แล้วแก้ conflict ในเครื่อง",
    flow: ["local", "wd"],
    risk: "safe",
    team: "ทีมใช้ merge เป็นหลัก และ PR ต้อง merge แบบ merge commit ห้าม squash",
  },
  {
    id: "rebase",
    group: "branch",
    cmd: "git rebase develop",
    short: "ย้ายงานไปต่อท้าย",
    simple: "ยก commit ของเราไปวางต่อท้าย develop ล่าสุด ประวัติจะเป็นเส้นตรงดูง่าย แต่ Git เขียน commit ของเราใหม่ทั้งหมด (รหัส commit เปลี่ยน)",
    when: "จัดระเบียบ commit บน branch ในเครื่องที่ยังไม่เคย push เท่านั้น",
    flow: ["local", "local"],
    risk: "care",
    caution: "ถ้า branch นั้น push ไปแล้ว ต้อง force push ตามมา และคนอื่นที่ใช้ branch เดียวกันจะประวัติชน",
    team: "ห้าม rebase branch ที่เปิด PR แล้ว ให้ใช้ merge develop เข้ามาแทน",
  },
  {
    id: "cherry-pick",
    group: "branch",
    cmd: "git cherry-pick <commit>",
    short: "หยิบ commit เดียวมา",
    simple: "คัดลอกการแก้ของ commit เดียวจาก branch อื่นมาใส่ branch นี้",
    when: "ต้องการแค่การแก้เดียว ไม่ใช่ทั้ง branch",
    flow: ["local", "local"],
    risk: "care",
    caution: "ได้ commit ใหม่ที่ซ้ำกับต้นฉบับ ถ้าภายหลัง merge ทั้ง branch อาจเจอ conflict ซ้ำ ปกติทีมใช้ back-merge แทน",
  },
  // ── undo ──
  {
    id: "restore",
    group: "undo",
    cmd: "git restore <ไฟล์>",
    short: "ทิ้งที่แก้ในไฟล์",
    simple: "คืนไฟล์ให้เป็นเหมือน commit ล่าสุด การแก้ที่ยังไม่ add จะหายไป",
    when: "แก้ไฟล์จนเละ อยากเริ่มใหม่จากของเดิม",
    flow: ["local", "wd"],
    risk: "danger",
    caution: "การแก้ที่ยังไม่ commit หายถาวร ไม่มีที่กู้คืน",
  },
  {
    id: "restore-staged",
    group: "undo",
    cmd: "git restore --staged <ไฟล์>",
    short: "เอาออกจากตะกร้า",
    simple: "ยกเลิกการ add ไฟล์นั้น การแก้ในไฟล์ยังอยู่ครบ แค่ไม่เข้า commit ถัดไป",
    when: "เผลอ add ไฟล์ที่ไม่ควรเข้า commit (เช่น .env)",
    flow: ["stage", "wd"],
    risk: "safe",
  },
  {
    id: "amend",
    group: "undo",
    cmd: 'git commit --amend -m "fix: ข้อความที่ถูก"',
    short: "แก้ commit ล่าสุด",
    simple: "แก้ข้อความหรือเพิ่มไฟล์ที่ลืมเข้าไปใน commit ล่าสุด แทนการสร้าง commit ใหม่",
    when: "เพิ่ง commit แล้วเห็นว่าพิมพ์ผิดหรือลืมไฟล์ และยังไม่ได้ push",
    flow: ["stage", "local"],
    risk: "care",
    caution: "ถ้า push ไปแล้ว ห้าม amend เพราะต้อง force push ให้สร้าง commit ใหม่แก้แทน",
  },
  {
    id: "revert",
    group: "undo",
    cmd: "git revert <commit>",
    short: "ย้อนผลแบบปลอดภัย",
    simple: "สร้าง commit ใหม่ที่ทำสิ่งตรงข้ามกับ commit ที่ผิด ประวัติเดิมยังอยู่ครบ ทุกคนเห็นว่าย้อนอะไรไป",
    when: "ต้องการยกเลิกสิ่งที่ push ไปแล้ว หรืออยู่บน branch ที่ใช้ร่วมกัน",
    flow: ["local", "local"],
    risk: "safe",
  },
  {
    id: "reset-soft",
    group: "undo",
    cmd: "git reset --soft HEAD~1",
    short: "ยกเลิก commit แต่เก็บงาน",
    simple: "ถอย commit ล่าสุดออก แต่การแก้ทั้งหมดยังอยู่ในตะกร้า พร้อม commit ใหม่",
    when: "commit ผิดก้อน อยากแบ่งใหม่ และยังไม่ได้ push",
    flow: ["local", "stage"],
    risk: "care",
    caution: "ใช้กับ commit ที่ยังไม่ push เท่านั้น",
  },
  {
    id: "reset-hard",
    group: "undo",
    cmd: "git reset --hard HEAD~1",
    short: "ลบ commit และงานทิ้ง",
    simple: "ถอย branch กลับไปและทิ้งการแก้ทุกอย่างที่ยังไม่ commit ไฟล์ในเครื่องจะเหมือนจุดนั้นเป๊ะ",
    when: "เกือบไม่ควรใช้ ส่วนใหญ่ revert หรือ restore ปลอดภัยกว่า",
    flow: ["local", "wd"],
    risk: "danger",
    caution: "งานที่ยังไม่ commit หายถาวร และถ้าถอย commit ที่ push ไปแล้ว ต้อง force push ตามมา ห้ามใช้บน branch ที่ใช้ร่วมกัน",
  },
  // ── look ──
  {
    id: "log",
    group: "look",
    cmd: "git log --oneline --graph --all --decorate",
    short: "แผนที่ประวัติทั้งหมด",
    simple: "วาดประวัติ commit ของทุก branch เป็นเส้นในหน้าจอ บรรทัดละหนึ่ง commit",
    when: "ก่อนเริ่มงานและก่อน merge เพื่อดูว่าทุก branch อยู่ตรงไหน",
    risk: "safe",
  },
  {
    id: "show",
    group: "look",
    cmd: "git show <commit>",
    short: "ดู commit เดียว",
    simple: "แสดงว่า commit นั้นใครทำ เมื่อไร ข้อความว่าอะไร และแก้บรรทัดไหนบ้าง",
    when: "ตามหาว่าการเปลี่ยนแปลงหนึ่งมาจากไหน",
    risk: "safe",
  },
  {
    id: "tag",
    group: "look",
    cmd: "git tag v1.2.0\ngit push origin v1.2.0",
    short: "ติดป้ายเวอร์ชัน",
    simple: "ตั้งชื่อเวอร์ชันให้ commit หนึ่ง เพื่อย้อนกลับมาหาได้ง่าย ป้ายต้อง push แยกต่างหาก",
    when: "หลัง release หรือ hotfix ถูก merge เข้า main",
    flow: ["local", "remote"],
    risk: "safe",
    team: "ทุก commit บน main ต้องมี tag เวอร์ชัน (ดูสถานการณ์ release และ hotfix ในหน้านี้)",
  },
];
