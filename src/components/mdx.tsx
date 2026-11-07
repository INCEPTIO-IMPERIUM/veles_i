import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, ListChecks, TriangleAlert } from "lucide-react";
import { useExplainMode } from "@/lib/explainMode";
import { project } from "@/project.config";
import { Pre } from "./CodeBlock";
import { Term } from "./Term";

const bodyClass = "alert-body flex flex-col gap-2";

/** Only rendered in "แบบง่าย" mode. */
export function Simple({ children }: { children: ReactNode }) {
  const { mode } = useExplainMode();
  return mode === "simple" ? <div className="flex flex-col gap-4">{children}</div> : null;
}

/** Only rendered in "แบบละเอียด" mode. */
export function Detail({ children }: { children: ReactNode }) {
  const { mode } = useExplainMode();
  return mode === "detail" ? <div className="flex flex-col gap-4">{children}</div> : null;
}

/** Project-specific example, so the surrounding prose stays generic. */
export function Example({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <aside className="alert alert--brand">
      <span className="alert-icon">
        <Lightbulb size={18} />
      </span>
      <div>
        <p className="alert-title">{title ?? `ตัวอย่างจาก ${project.name}`}</p>
        <div className={bodyClass}>{children}</div>
      </div>
    </aside>
  );
}

/** A rule people must not break. */
export function Warning({ children, title = "ห้ามพลาด" }: { children: ReactNode; title?: string }) {
  return (
    <aside className="alert alert--warning">
      <span className="alert-icon">
        <TriangleAlert size={18} />
      </span>
      <div>
        <p className="alert-title">{title}</p>
        <div className={bodyClass}>{children}</div>
      </div>
    </aside>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="card card--flat">
      <p className="card-meta flex items-center gap-2">
        <ListChecks size={14} /> ขั้นตอน
      </p>
      <div className="card-body">{children}</div>
    </div>
  );
}

/** Markdown links: in-site paths go through the router, others open in a new tab. */
function MdxLink({ href = "", children }: { href?: string; children?: ReactNode }) {
  if (href.startsWith("/")) return <Link to={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

/** Components available inside every .mdx file without importing. */
export const mdxComponents = { a: MdxLink, pre: Pre, Simple, Detail, Example, Warning, Steps, Term };
