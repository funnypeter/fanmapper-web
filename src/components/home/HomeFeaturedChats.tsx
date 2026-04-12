"use client";

import TrendingChats from "@/components/TrendingChats";
import TVTrendingChats from "@/components/TVTrendingChats";

export default function HomeFeaturedChats() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-error/20 bg-gradient-to-br from-error/[0.08] via-transparent to-primary/[0.06] p-6 sm:p-8">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-error/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/15 border border-error/30">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="text-[11px] font-bold text-error uppercase tracking-wider">Live Now</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Join the conversation</h2>
        </div>
        <p className="text-text-secondary text-sm mb-6">
          Thousands of fans are talking about their favorite games and shows right now.
        </p>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">🎮 Games</p>
            <TrendingChats hideHeader />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">📺 TV Shows</p>
            <TVTrendingChats hideHeader />
          </div>
        </div>
      </div>
    </section>
  );
}
