# veles

คู่มือรวมความรู้สำหรับทำโปรเจกต์ (tech stack, Git, กฎการเขียนโค้ด, CI/CD) แบบ interactive
อ่านได้ทั้งคนที่เขียนโค้ดและไม่ได้เขียน เนื้อหาตั้งต้นเรียบเรียงจาก `docs/` ของ CMAS
ใช้ design system Nocturnal Atelier v3.2 ชุดเดียวกับต้นแบบของ CMAS
(`docs/pages/index-q-design-system.html`) และเพิ่มโหมดมืด

## รัน

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # typecheck + build ลง dist/
npm run typecheck
```

## โครงสร้าง

```
src/
  project.config.ts      ชื่อโปรเจกต์ branch คำสั่ง พอร์ต: แก้ไฟล์นี้ไฟล์เดียวเมื่อใช้กับโปรเจกต์อื่น
  content/
    sections.ts          รายการหน้าทั้งหมด (sidebar, ค้นหา, ลำดับการอ่านตามบทบาท)
    glossary.ts          คำศัพท์ (ใช้กับหน้าคำศัพท์และ <Term>)
    pages/*.mdx          เนื้อหาแต่ละหน้า
  components/
    layout/              AppLayout, Sidebar
    mdx.tsx              <Simple> <Detail> <Example> <Warning> <Steps> <Term> ใช้ใน .mdx ได้เลย
    SearchDialog.tsx     Ctrl K
  features/<หน้า>/        หน้าที่มี interaction ของตัวเอง (start, glossary, ...)
  lib/                   theme, explainMode, progress, storage (localStorage แบบกันพัง)
  styles/                tokens.css = โทเคน Nocturnal Atelier (ชื่อตรงกับต้นแบบ CMAS: peri, haze, ink, wash, edge, ok/warn/bad/info)
                         dark.css = โหมดมืด (6 ค่าจากต้นแบบ ที่เหลือคำนวณเอง)
                         base.css, components.css, prose.css = สไตล์ของ veles สร้างจากโทเคนเท่านั้น
```

## เพิ่มหน้าใหม่

1. เพิ่ม entry ใน `src/content/sections.ts` (ใส่ `status: "soon"` ไว้ก่อนได้ หน้าจะขึ้นว่า "กำลังเขียน")
2. เขียน `src/content/pages/<id>.mdx` หรือ component ใน `src/features/<id>/`
3. ผูกใน `pages` ของ `src/App.tsx` แล้วเปลี่ยน status เป็น `"ready"`

## อัปเดต theme จาก CMAS

ต้นแบบคือ `CMAS/docs/pages/index-q-design-system.html` (สร้างจาก `index-q.html` ด้วย
`scripts/build-index-q-design-system.py`) ถ้าค่าสีหรือขนาดในนั้นเปลี่ยน ให้แก้ `src/styles/tokens.css`
ให้ตรง และถ้ามี token สีใหม่ ให้เพิ่มค่าโหมดมืดของมันใน `dark.css` ด้วย

กฎของ design system ที่ veles ทำตาม: สีรอง (fgray, csub, mount, ev1, ev2) ใช้กับกราฟและงานตกแต่งเท่านั้น,
`dim` และ `faint` ไม่ผ่านเกณฑ์ contrast ของตัวอักษรขนาดปกติ จึงใช้กับไอคอนและเส้นเท่านั้น (ตัวอักษรรองใช้ `ink2`),
น้ำหนักตัวอักษรสูงสุด 600
