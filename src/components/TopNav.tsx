"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabItem {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

const GAMES_TABS: TabItem[] = [
  { href: "/explore", label: "Discover" },
  { href: "/library", label: "Library", requiresAuth: true },
  { href: "/stats", label: "Stats", requiresAuth: true },
];

const TV_TABS: TabItem[] = [
  { href: "/tv", label: "Discover" },
  { href: "/tv/library", label: "Library", requiresAuth: true },
  { href: "/tv/stats", label: "Stats", requiresAuth: true },
];

const GAMES_ROUTES = ["/explore", "/library", "/stats", "/game", "/wiki"];
const TV_ROUTES = ["/tv"];

export default function TopNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  // Determine which section we're in
  const isTV = TV_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isGames = GAMES_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // Don't show tabs if not in Games or TV section
  if (!isTV && !isGames) return null;

  const tabs = isTV ? TV_TABS : GAMES_TABS;
  const visibleTabs = tabs.filter((tab) => !tab.requiresAuth || isLoggedIn);

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
