import { useExplainMode, type ExplainMode } from "@/lib/explainMode";

const options: { value: ExplainMode; label: string; hint: string }[] = [
  { value: "simple", label: "แบบง่าย", hint: "อธิบายด้วยการเปรียบเทียบ ไม่มีคำสั่ง" },
  { value: "detail", label: "แบบละเอียด", hint: "กฎจริง คำสั่ง และ path ของไฟล์" },
];

/** Segmented control that switches every <Simple>/<Detail> block on the site. */
export function ExplainToggle() {
  const { mode, setMode } = useExplainMode();

  return (
    <div
      role="radiogroup"
      aria-label="ระดับคำอธิบาย"
      className="inline-flex rounded-md border border-edge bg-wash p-0.5"
    >
      {options.map((o) => {
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.hint}
            onClick={() => setMode(o.value)}
            className={[
              "rounded-sm px-3 py-1.5 text-label font-semibold transition-colors",
              active ? "bg-ink text-card" : "text-ink2 hover:text-ink",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
