import {
  Activity,
  FileSearch,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  /** Build stage that ships this screen; items without an href are not live yet. */
  stage?: number;
}

const NAV: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, href: "/" },
  { label: "Case finder", icon: Activity, stage: 2 },
  { label: "Note search", icon: FileSearch, stage: 2 },
  { label: "Similar patients", icon: Users, stage: 3 },
  { label: "Audit log", icon: ScrollText, stage: 1 },
  { label: "Settings", icon: Settings, stage: 1 },
];

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-md bg-accent-soft ring-1 ring-accent/40"
      >
        <svg viewBox="0 0 24 24" className="size-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3c-2.5 3-6 4.5-6 9a6 6 0 0 0 12 0c0-4.5-3.5-6-6-9Z" />
          <path d="M9 13h6M12 10v6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-sm font-semibold tracking-tight text-fg">Lupus Case Finder</span>
    </span>
  );
}

function NavList({ activeHref, orientation }: { activeHref: string; orientation: "vertical" | "horizontal" }) {
  return (
    <ul className={cn(orientation === "vertical" ? "flex flex-col gap-0.5" : "flex gap-1 overflow-x-auto")}>
      {NAV.map(({ label, icon: Icon, href, stage }) => {
        const base =
          "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors whitespace-nowrap";
        if (!href) {
          return (
            <li key={label}>
              <span
                aria-disabled="true"
                title={`Coming in stage ${stage}`}
                className={cn(base, "cursor-not-allowed text-fg-subtle")}
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
                {orientation === "vertical" && (
                  <span className="ml-auto font-mono text-[10px] text-fg-subtle">S{stage}</span>
                )}
              </span>
            </li>
          );
        }
        const active = href === activeHref;
        return (
          <li key={label}>
            <a
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                base,
                active
                  ? "bg-surface-raised text-fg ring-1 ring-border-strong"
                  : "text-fg-muted hover:bg-surface-raised hover:text-fg",
              )}
            >
              <Icon aria-hidden="true" className={cn("size-4", active && "text-accent")} />
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function AppShell({ children, activeHref = "/" }: { children: ReactNode; activeHref?: string }) {
  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-accent-fg"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-(--sidebar-width) flex-col border-r border-border bg-surface-sunken md:flex">
        <div className="flex h-(--topbar-height) items-center border-b border-border px-4">
          <Logo />
        </div>
        <nav aria-label="Main" className="flex-1 p-3">
          <NavList activeHref={activeHref} orientation="vertical" />
        </nav>
        <div className="border-t border-border p-4 text-xs text-fg-subtle">
          <p>Portfolio project. Synthetic data only.</p>
        </div>
      </aside>

      <div className="md:pl-(--sidebar-width)">
        <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
          <div className="flex h-(--topbar-height) items-center justify-between gap-4 px-4 md:px-8">
            <span className="md:hidden">
              <Logo />
            </span>
            <span className="hidden text-sm text-fg-muted md:inline">Overview</span>
            <div className="flex items-center gap-2">
              <Badge tone="warning">Synthetic data</Badge>
              <Badge tone="neutral" className="hidden sm:inline-flex">
                De-identified view
              </Badge>
            </div>
          </div>
          <nav aria-label="Main" className="border-t border-border px-3 py-2 md:hidden">
            <NavList activeHref={activeHref} orientation="horizontal" />
          </nav>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-(--content-max) px-4 py-8 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
