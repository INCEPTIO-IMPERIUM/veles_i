import { lazy, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter, Link, RouterProvider, type RouteObject } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MdxPage } from "@/components/MdxPage";
import { sections } from "@/content/sections";
import { StartPage } from "@/features/start/StartPage";
import { GlossaryPage } from "@/features/glossary/GlossaryPage";
import { ComingSoonPage } from "@/features/placeholder/ComingSoonPage";

/**
 * Each MDX page (with the widgets it imports) is its own chunk, fetched when the
 * reader opens it. AppLayout holds the <Suspense> boundary that covers the wait.
 * Start and Glossary stay in the main bundle: they are the first things people see.
 */
function mdxPage(id: string, load: () => Promise<{ default: ComponentType }>): ReactNode {
  return <MdxPage Content={lazy(load)} id={id} />;
}

/** Pages that exist. Any section without an entry here shows ComingSoonPage. */
const pages: Record<string, ReactNode> = {
  start: <StartPage />,
  glossary: <GlossaryPage />,
  setup: mdxPage("setup", () => import("@/content/pages/setup.mdx")),
  stack: mdxPage("stack", () => import("@/content/pages/stack.mdx")),
  code: mdxPage("code", () => import("@/content/pages/code.mdx")),
  database: mdxPage("database", () => import("@/content/pages/database.mdx")),
  git: mdxPage("git", () => import("@/content/pages/git.mdx")),
  review: mdxPage("review", () => import("@/content/pages/review.mdx")),
  ci: mdxPage("ci", () => import("@/content/pages/ci.mdx")),
  security: mdxPage("security", () => import("@/content/pages/security.mdx")),
  about: mdxPage("about", () => import("@/content/pages/about.mdx")),
};

function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1>ไม่พบหน้านี้</h1>
      <p className="mt-2 text-ink2">ลิงก์อาจเก่าแล้ว ลองค้นหาด้วย Ctrl K</p>
      <Link to="/" className="btn btn--primary mt-6">
        กลับหน้าเริ่มที่นี่
      </Link>
    </div>
  );
}

const children: RouteObject[] = sections.map((s) => ({
  path: s.path,
  element: pages[s.id] ?? <ComingSoonPage section={s} />,
}));

const router = createBrowserRouter([
  { element: <AppLayout />, children: [...children, { path: "*", element: <NotFound /> }] },
]);

export function App() {
  return <RouterProvider router={router} />;
}
