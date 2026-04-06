import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6 py-3">
        <h1 className="text-xl font-bold">
          Fan<span className="text-primary">Mapper</span>
        </h1>
        <nav className="flex items-center gap-6">
          <Link href="/library" className="text-sm text-text-secondary hover:text-foreground transition">Library</Link>
          <Link href="/explore" className="text-sm text-text-secondary hover:text-foreground transition">Explore</Link>
          <Link href="/profile" className="text-sm text-text-secondary hover:text-foreground transition">Profile</Link>
        </nav>
      </header>
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
