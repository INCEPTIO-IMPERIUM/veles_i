import { NavLink } from "react-router-dom";
import { Check } from "lucide-react";
import { groupLabels, sections, type Section } from "@/content/sections";
import { useProgress } from "@/lib/progress";

const groups = Object.keys(groupLabels) as Section["group"][];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { isRead } = useProgress();

  return (
    <nav aria-label="เมนูหลัก" className="flex flex-col gap-6 p-4">
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-2 px-3 text-overline font-semibold uppercase tracking-[0.16em] text-ink2">
            {groupLabels[group]}
          </p>
          <ul className="flex flex-col gap-0.5">
            {sections
              .filter((s) => s.group === group)
              .map((s) => (
                <li key={s.id}>
                  <NavLink
                    to={s.path}
                    end={s.path === "/"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 rounded-sm px-3 py-2 text-body no-underline transition-colors hover:no-underline",
                        isActive
                          ? "bg-sel-bg font-semibold text-sel"
                          : "text-ink hover:bg-field",
                      ].join(" ")
                    }
                  >
                    <s.icon size={18} strokeWidth={1.75} aria-hidden />
                    <span className="flex-1">{s.title}</span>
                    {s.status === "soon" && (
                      <span className="text-caption text-ink2">เร็วๆ นี้</span>
                    )}
                    {s.status === "ready" && isRead(s.id) && (
                      <Check size={16} className="text-ok" aria-label="อ่านแล้ว" />
                    )}
                  </NavLink>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
