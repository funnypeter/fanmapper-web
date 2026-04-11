"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { findTVWikiConfigByTmdbId, TV_SHOW_REGISTRY } from "@/lib/services/tvRegistry";
import type { TVDBShowDetail, TVDBEpisode } from "@/lib/services/tvdb";
import TVGuideArticles from "@/components/TVGuideArticles";

interface UserShowData {
  status: string;
  rating: number | null;
  review: string | null;
  current_season: number;
  current_episode: number;
}

const STATUSES = [
  { value: "watching", label: "Watching", icon: "📺", color: "bg-primary" },
  { value: "completed", label: "Completed", icon: "✅", color: "bg-success" },
  { value: "backlog", label: "Backlog", icon: "📋", color: "bg-xp" },
  { value: "wishlist", label: "Wishlist", icon: "💜", color: "bg-accent" },
  { value: "dropped", label: "Dropped", icon: "❌", color: "bg-error" },
];

export default function TVShowDetailContent({ showId }: { showId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [show, setShow] = useState<TVDBShowDetail | null>(null);
  const [userShow, setUserShow] = useState<UserShowData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [checkedEpisodes, setCheckedEpisodes] = useState<Set<string>>(new Set());
  // Find wiki config for this show
  const registryMatch = findTVWikiConfigByTmdbId(showId);
  const wikiKey = registryMatch?.key ?? null;

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      const res = await fetch(`/api/tv/${showId}`);
      if (res.ok) {
        const data = await res.json();
        setShow(data);
        if (data.seasons?.[0]) setExpandedSeason(data.seasons[0].seasonNumber);
      }

      if (u) {
        const { data: us } = await supabase.from("user_shows").select("*").eq("user_id", u.id).eq("show_id", showId).single();
        if (us) { setUserShow(us); setUserRating(us.rating ?? 0); }

        const wikiKey = registryMatch?.key ?? showId;
        const { data: progress } = await supabase.from("tv_wiki_progress").select("page_id").eq("user_id", u.id).eq("show_key", wikiKey);
        if (progress) setCheckedEpisodes(new Set(progress.map((p) => p.page_id)));
      }

      const wikiKey = registryMatch?.key ?? showId;
      const local = localStorage.getItem(`tv-progress-${wikiKey}`);
      if (local) {
        const localSet = new Set<string>(JSON.parse(local));
        setCheckedEpisodes((prev) => new Set([...prev, ...localSet]));
      }

      setLoading(false);
    }
    load();
  }, [showId]);

  async function handleAddToLibrary() {
    if (!user) { router.push("/auth/login"); return; }
    setSaving(true);
    try {
      if (show) {
        await supabase.from("tv_shows").upsert({
          id: show.id, tvdb_id: show.tmdbId, title: show.title, poster_url: show.posterUrl,
          genres: show.genres, network: show.network,
          release_date: show.releaseDate, summary: show.summary,
        }, { onConflict: "id" });
      }
      const { error } = await supabase.from("user_shows").upsert({
        user_id: user.id, show_id: showId, status: "backlog", updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,show_id" });
      if (!error) setUserShow({ status: "backlog", rating: null, review: null, current_season: 1, current_episode: 0 });
    } catch {}
    setSaving(false);
  }

  const changeStatus = useCallback(async (status: string) => {
    if (!user) return;
    await supabase.from("user_shows").update({ status, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("show_id", showId);
    setUserShow((prev) => prev ? { ...prev, status } : null);
  }, [user, showId, supabase]);

  const updateRating = useCallback(async (r: number) => {
    if (!user || !userShow) return;
    setUserRating(r);
    await supabase.from("user_shows").update({ rating: r, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("show_id", showId);
    setUserShow((prev) => prev ? { ...prev, rating: r } : null);
  }, [user, userShow, showId, supabase]);

  async function removeFromLibrary() {
    if (!user) return;
    await supabase.from("user_shows").delete().eq("user_id", user.id).eq("show_id", showId);
    setUserShow(null); setUserRating(0);
  }

  async function toggleEpisode(ep: TVDBEpisode) {
    const epId = `s${ep.seasonNumber}e${ep.episodeNumber}`;
    const wikiKey = registryMatch?.key ?? showId;
    const newChecked = new Set(checkedEpisodes);

    if (newChecked.has(epId)) {
      newChecked.delete(epId);
      if (user) {
        await supabase.from("tv_wiki_progress").delete().eq("user_id", user.id).eq("show_key", wikiKey).eq("page_id", epId);
      }
    } else {
      newChecked.add(epId);
      if (user) {
        await supabase.from("tv_wiki_progress").upsert({
          user_id: user.id, show_key: wikiKey, page_id: epId, page_title: ep.title,
        }, { onConflict: "user_id,show_key,page_id" });
      }
    }

    setCheckedEpisodes(newChecked);
    localStorage.setItem(`tv-progress-${wikiKey}`, JSON.stringify([...newChecked]));
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!show) {
    return <p className="text-text-secondary text-center py-20">Show not found</p>;
  }

  const inLibrary = !!userShow;
  const totalEpisodes = show.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
  const watchedEpisodes = checkedEpisodes.size;

  return (
    <div>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        {show.posterUrl && (
          <div className="absolute inset-0">
            <img src={show.posterUrl} alt="" className="w-full h-full object-cover blur-2xl scale-125 opacity-25" />
          </div>
        )}
        <div className="relative flex flex-col sm:flex-row items-start gap-6 p-8">
          {show.posterUrl ? (
            <img src={show.posterUrl} alt={show.title} className="w-36 h-52 rounded-xl object-cover shadow-2xl border border-border/50 shrink-0" />
          ) : (
            <div className="w-36 h-52 rounded-xl bg-surface-elevated flex items-center justify-center text-4xl shrink-0">📺</div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold">{show.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {show.year && <span className="text-text-secondary">{show.year}</span>}
              {show.network && <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">{show.network}</span>}
              {show.status && <span className="text-xs bg-surface-elevated text-text-muted px-2 py-0.5 rounded-full">{show.status}</span>}
            </div>
            {show.rating && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 bg-primary/15 px-3 py-1.5 rounded-lg">
                  <span className="text-lg">⭐</span>
                  <span className="font-bold text-primary">{show.rating}</span>
                  <span className="text-xs text-text-muted">/ 100</span>
                </div>
              </div>
            )}
            {show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {show.genres.map((g) => <span key={g} className="text-xs bg-primary/10 text-primary-light px-2.5 py-1 rounded-full">{g}</span>)}
              </div>
            )}
            {totalEpisodes > 0 && (
              <p className="text-xs text-text-muted mt-2">{show.seasons.length} seasons · {totalEpisodes} episodes</p>
            )}
          </div>
        </div>
      </div>

      {/* Add to Library */}
      {!inLibrary ? (
        <div className="card-glass p-6 mb-6 text-center">
          <button onClick={handleAddToLibrary} disabled={saving} className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
            {saving ? "Adding..." : "+ Add to Library"}
          </button>
          {!user && (
            <p className="text-xs text-text-muted mt-3">
              <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link> to add shows to your library
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success bg-success/10 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            In Library
          </span>
        </div>
      )}

      {/* Library management */}
      {inLibrary && (
        <div className="card-glass p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Your Progress</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {STATUSES.map((s) => (
              <button key={s.value} onClick={() => changeStatus(s.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${
                  userShow?.status === s.value ? `${s.color} border-transparent text-white font-medium` : "border-border text-text-secondary hover:border-text-muted"
                }`}>
                <span>{s.icon}</span><span>{s.label}</span>
              </button>
            ))}
          </div>
          <div className="mb-5">
            <p className="text-sm text-text-secondary mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => updateRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl transition-transform hover:scale-125" style={{ color: n <= (hoverRating || userRating) ? "#FDCB6E" : "#484F58" }}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <button onClick={removeFromLibrary} className="w-full mt-2 py-3 rounded-xl border border-error/30 text-error text-sm font-medium hover:bg-error/10 transition">
            Remove from Library
          </button>
        </div>
      )}

      {/* Track Progress card */}
      {wikiKey && (
        <div className="mb-6">
          <Link href={`/tv/wiki/${wikiKey}`}
            className="card-glass p-5 flex items-center gap-4 hover:border-primary/30 transition group">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-xl shrink-0">📖</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm group-hover:text-primary transition">Track Progress</p>
              <p className="text-xs text-text-muted">Wiki checklists</p>
            </div>
            <span className="text-primary">→</span>
          </Link>
        </div>
      )}

      {/* Cast */}
      {show.cast.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Cast</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {show.cast.map((member, i) => (
              <div key={i} className="flex-shrink-0 w-[100px] text-center">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-border/50" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-surface-elevated flex items-center justify-center text-text-muted text-2xl mx-auto">👤</div>
                )}
                <p className="text-xs font-semibold mt-2 truncate">{member.name}</p>
                <p className="text-[10px] text-text-muted truncate">{member.characterName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Episode Guide */}
      {show.seasons.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Episode Guide</h3>
            {totalEpisodes > 0 && (
              <span className="text-xs text-text-muted">{watchedEpisodes} / {totalEpisodes} watched</span>
            )}
          </div>

          {totalEpisodes > 0 && (
            <div className="h-2 rounded-full bg-surface-elevated mb-4 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.round((watchedEpisodes / totalEpisodes) * 100)}%` }} />
            </div>
          )}

          <div className="space-y-2">
            {show.seasons.map((season) => {
              const isExpanded = expandedSeason === season.seasonNumber;
              const seasonChecked = season.episodes.filter((ep) => checkedEpisodes.has(`s${ep.seasonNumber}e${ep.episodeNumber}`)).length;

              return (
                <div key={season.seasonNumber} className="card-glass overflow-hidden">
                  <button
                    onClick={() => setExpandedSeason(isExpanded ? null : season.seasonNumber)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-elevated/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">Season {season.seasonNumber}</span>
                      <span className="text-xs text-text-muted">{season.episodes.length} episodes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-primary font-medium">{seasonChecked}/{season.episodes.length}</span>
                      <span className={`text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/30">
                      {season.episodes.map((ep) => {
                        const epId = `s${ep.seasonNumber}e${ep.episodeNumber}`;
                        const isChecked = checkedEpisodes.has(epId);

                        return (
                          <div key={ep.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-b-0 hover:bg-surface-elevated/30 transition">
                            <button
                              onClick={() => toggleEpisode(ep)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                                isChecked ? "bg-primary border-primary text-white" : "border-border hover:border-primary/50"
                              }`}
                            >
                              {isChecked && <span className="text-xs">✓</span>}
                            </button>

                            {ep.image && (
                              <img src={ep.image} alt="" className="w-16 h-10 rounded object-cover shrink-0" />
                            )}

                            <a
                              href={wikiKey ? `/tv/wiki/${wikiKey}/${encodeURIComponent(ep.title)}` : undefined}
                              onClick={(e) => {
                                if (!wikiKey) { e.preventDefault(); return; }
                              }}
                              className={`flex-1 min-w-0 ${wikiKey ? "cursor-pointer" : ""}`}
                            >
                              <p className={`text-sm font-medium truncate ${isChecked ? "text-text-muted line-through" : ""} ${wikiKey ? "hover:text-primary transition" : ""}`}>
                                <span className="text-text-muted mr-1">E{ep.episodeNumber}</span>
                                {ep.title}
                              </p>
                              <div className="flex items-center gap-2">
                                {ep.aired && <span className="text-[10px] text-text-muted">{ep.aired}</span>}
                                {ep.runtime && <span className="text-[10px] text-text-muted">· {ep.runtime}min</span>}
                              </div>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TVGuide Articles */}
      <TVGuideArticles showTitle={show.title} />

      {/* About */}
      {show.summary && (
        <div className="card-glass p-6 mb-8">
          <h3 className="text-xl font-bold mb-3">About</h3>
          <p className="text-text-secondary leading-relaxed">{show.summary}</p>
        </div>
      )}
    </div>
  );
}
