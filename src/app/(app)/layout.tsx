import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/explore" className="text-xl font-bold tracking-tight">
            Fan<span className="text-primary">Mapper</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/explore" className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-foreground hover:bg-surface transition">
              Explore
            </Link>
            {user && (
              <Link href="/library" className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-foreground hover:bg-surface transition">
                Library
              </Link>
            )}
            {user ? (
              <Link href="/profile" className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-foreground hover:bg-surface transition">
                Profile
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm px-4 py-2">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
