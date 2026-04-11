"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabItem {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

const TABS: TabItem[] = [
  { href: "/explore", label: "Discover" },
  { href: "/library", label: "Library", requiresAuth: true },
  { href: "/stats", label: "Stats", requiresAuth: true },
];

export default function TopNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  const visibleTabs = TABS.filter((tab) => !tab.requiresAuth || isLoggedIn);

  return (
    <nav className="w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex">
        {visibleTabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 text-center py-3 text-sm font-semibold transition-all relative ${
                isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
