import { Suspense, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { project } from "@/project.config";
import { useTheme } from "@/lib/theme";
import { ExplainToggle } from "@/components/ExplainToggle";
import { SearchDialog } from "@/components/SearchDialog";
import { PageToc } from "./PageToc";
import { Sidebar } from "./Sidebar";

/** Shown while a page's chunk downloads. Kept the height of a short page so the footer doesn't jump. */
function PageLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-body text-ink2" role="status">
      กำลังโหลดหน้า…
    </div>
  );
}

export function AppLayout() {
  const { theme, toggle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Ctrl+K / ⌘K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // New page → back to top, unless a #anchor asks the page to scroll itself.
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
    setDrawerOpen(false);
  }, [pathname, hash]);

  return (
    <div className="min-h-screen bg-tint">
      <header className="nav-glass sticky top-0 z-[200] border-b border-edge">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            className="btn btn--ghost btn--icon lg:hidden"
            aria-label="เปิดเมนู"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>
          {/* Same width as the sidebar so the brand sits above the menu. */}
          <Link to="/" className="flex shrink-0 items-center gap-2 text-ink no-underline hover:no-underline lg:w-56">
            <img src="/favicon.svg" alt="" width={28} height={28} />
            <span className="text-h4 font-semibold tracking-tight">veles</span>
            <span className="hidden text-body-sm text-ink2 sm:inline">· {project.name}</span>
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex h-10 min-w-0 items-center gap-2 whitespace-nowrap rounded-md border border-edge bg-card px-3 text-body-sm text-ink2 transition-colors hover:border-dim sm:w-80"
          >
            <Search size={16} className="shrink-0" aria-hidden />
            <span className="hidden truncate sm:inline">ค้นหาหัวข้อหรือคำศัพท์</span>
            <span className="kbd ml-auto hidden shrink-0 whitespace-nowrap sm:inline-flex">Ctrl K</span>
            <span className="sr-only sm:hidden">ค้นหา</span>
          </button>

          <div className="hidden md:block">
            <ExplainToggle />
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
            title={theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Sidebar pinned to the left edge; the content takes everything else. On very wide
          screens an "on this page" column fills the right instead of empty margins. */}
      <div className="flex">
        <aside
          className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-edge bg-card lg:block"
        >
          <Sidebar />
        </aside>

        <main className="min-w-0 flex-1 px-3 py-3 sm:px-6 sm:py-6">
          <div className="mb-3 md:hidden">
            <ExplainToggle />
          </div>
          <div className="flex gap-6">
            <div className="min-w-0 flex-1">
              <div
                ref={contentRef}
                className="page-card min-h-[calc(100vh-6rem)] px-5 py-8 sm:px-10 sm:py-10 xl:px-14"
              >
                <Suspense fallback={<PageLoading />}>
                  <Outlet />
                </Suspense>
              </div>
              <footer className="px-2 py-6 text-center text-caption text-ink2">
                veles · เนื้อหาอิงจาก docs ของ {project.name} · design system Nocturnal Atelier
              </footer>
            </div>
            <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto 2xl:block">
              <PageToc rootRef={contentRef} path={pathname} />
            </aside>
          </div>
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[300] lg:hidden" role="dialog" aria-modal="true" aria-label="เมนู">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="ปิดเมนู"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-card shadow-pop">
            <div className="flex items-center justify-between p-4 pb-0">
              <span className="text-h4 font-semibold">veles</span>
              <button
                type="button"
                className="btn btn--ghost btn--icon"
                aria-label="ปิดเมนู"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
