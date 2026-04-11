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
    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
      {visibleTabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-primary text-white"
                : "text-text-muted hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
