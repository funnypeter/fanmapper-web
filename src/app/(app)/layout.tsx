import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar — logo + nav tabs + sign in */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/explore" className="text-xl font-bold tracking-tight flex-shrink-0">
              Fan<span className="text-primary">Mapper</span>
            </Link>
            <TopNav isLoggedIn={!!user} />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {user ? (
              <Link href="/profile" className="text-text-muted hover:text-foreground transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm px-4 py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
