import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar — logo + sign in */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 border-b border-border/30">
          <Link href="/explore" className="text-xl font-bold tracking-tight">
            Fan<span className="text-primary">Mapper</span>
          </Link>
          {!user && (
            <Link href="/auth/login" className="btn-primary text-sm px-4 py-2">
              Sign In
            </Link>
          )}
        </div>

        {/* Tab bar */}
        <TopNav isLoggedIn={!!user} />
      </header>

      <main className="flex-1 pb-24">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}
