import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";
import type { Section } from "@/content/sections";

/** Stand-in for sections still being written. Lists the docs they'll draw from. */
export function ComingSoonPage({ section }: { section: Section }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-sel-bg text-sel">
        <section.icon size={28} strokeWidth={1.75} />
      </span>
      <h1>{section.title}</h1>
      <p className="text-body-lg text-ink2">{section.summary}</p>
      <p className="badge badge--warning inline-flex items-center gap-1.5">
        <Hammer size={12} /> หน้านี้กำลังเขียน
      </p>
      {section.sources && (
        <div className="mt-4 w-full rounded-md border border-edge bg-wash p-4 text-left">
          <p className="text-label font-semibold text-ink2">เนื้อหาจะเรียบเรียงจาก</p>
          <ul className="mt-2 flex flex-col gap-1">
            {section.sources.map((src) => (
              <li key={src}>
                <code className="text-body-sm">{src}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link to="/" className="btn btn--outlined mt-2">
        กลับหน้าเริ่มที่นี่
      </Link>
    </div>
  );
}
