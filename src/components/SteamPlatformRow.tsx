"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SteamPlatformRow({ steamId: initialSteamId }: { steamId: string | null }) {
  const [steamId, setSteamId] = useState(initialSteamId);
  const [unlinking, setUnlinking] = useState(false);
  const supabase = createClient();

  async function handleUnlink() {
    setUnlinking(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ steam_id: null }).eq("id", user.id);
      setSteamId(null);
    }
    setUnlinking(false);
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50">
      <div className="flex items-center gap-3">
        <span className="text-xl">🎮</span>
        <span>Steam</span>
      </div>
      <div className="flex items-center gap-2">
        {steamId ? (
          <>
            <Link href="/profile/link-steam" className="text-xs font-medium px-2.5 py-1 rounded-full text-success bg-success/10 hover:bg-success/20 transition">
              Re-sync
            </Link>
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              className="text-xs font-medium px-2.5 py-1 rounded-full text-error bg-error/10 hover:bg-error/20 transition"
            >
              {unlinking ? "..." : "Unlink"}
            </button>
          </>
        ) : (
          <Link href="/profile/link-steam" className="text-xs text-primary font-medium hover:underline">
            Connect
          </Link>
        )}
      </div>
    </div>
  );
}
