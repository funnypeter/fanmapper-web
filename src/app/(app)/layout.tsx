import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal top bar — just logo */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/explore" className="text-xl font-bold tracking-tight">
            Fan<span className="text-primary">Mapper</span>
          </Link>
          {!user && (
            <Link href="/auth/login" className="btn-primary text-sm px-4 py-2">
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 pb-24">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>

      <BottomNav isLoggedIn={!!user} />
    </div>
  );
}
