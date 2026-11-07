import { Check } from "lucide-react";
import { useProgress } from "@/lib/progress";

/** Bottom-of-page "อ่านจบแล้ว" toggle that feeds the Start page progress bar. */
export function MarkReadButton({ id }: { id: string }) {
  const { isRead, toggleRead } = useProgress();
  const read = isRead(id);

  return (
    <div className="mt-6 flex items-center justify-between gap-4 rounded-md border border-edge bg-wash px-5 py-4">
      <span className="text-body text-ink2">
        {read ? "หัวข้อนี้นับว่าอ่านแล้ว" : "อ่านจบแล้ว? กดเพื่อนับความคืบหน้าในหน้าเริ่มที่นี่"}
      </span>
      <button
        type="button"
        onClick={() => toggleRead(id)}
        className={["btn btn--sm", read ? "btn--outlined" : "btn--primary"].join(" ")}
        aria-pressed={read}
      >
        <Check size={16} /> {read ? "อ่านแล้ว" : "อ่านจบแล้ว"}
      </button>
    </div>
  );
}
