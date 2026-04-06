"use client";

import { useState, useEffect } from "react";

interface SteamReview {
  id: string;
  positive: boolean;
  review: string;
  playtimeHours: number;
  votesUp: number;
  votesFunny: number;
  timestampCreated: number;
}

interface ReviewSummary {
  totalReviews: number;
  totalPositive: number;
  totalNegative: number;
  reviewScore: string;
}

const SCORE_COLORS: Record<string, string> = {
  "Overwhelmingly Positive": "text-success",
  "Very Positive": "text-success",
  "Positive": "text-success",
  "Mostly Positive": "text-accent",
  "Mixed": "text-xp",
  "Mostly Negative": "text-error",
  "Negative": "text-error",
  "Very Negative": "text-error",
  "Overwhelmingly Negative": "text-error",
};

export default function SteamReviews({ gameId }: { gameId: string }) {
  const [reviews, setReviews] = useState<SteamReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Extract Steam appid (format: "steam-{appid}" or just "{appid}")
    const steamAppId = gameId.startsWith("steam-") ? gameId.replace("steam-", "") : gameId;
    if (!steamAppId || steamAppId.startsWith("igdb-")) {
      setLoading(false);
      return;
    }

    fetch(`/api/reviews/${steamAppId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setSummary(data.summary ?? null);
      })
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) return null;
  if (!summary && reviews.length === 0) return null;

  const positivePercent = summary
    ? Math.round((summary.totalPositive / Math.max(summary.totalReviews, 1)) * 100)
    : 0;

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xl">🎮</span>
        <h3 className="text-xl font-bold">Steam Reviews</h3>
      </div>

      {/* Summary */}
      {summary && (
        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-surface-elevated/50">
          <div className="text-center">
            <p className={`text-lg font-bold ${SCORE_COLORS[summary.reviewScore] ?? "text-foreground"}`}>
              {summary.reviewScore}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {summary.totalReviews.toLocaleString()} reviews
            </p>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>👍 {positivePercent}%</span>
              <span>👎 {100 - positivePercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-error/30 overflow-hidden">
              <div className="h-full rounded-full bg-success transition-all" style={{ width: `${positivePercent}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-3">
        {reviews.map((r) => {
          const isLong = r.review.length > 200;
          const isExpanded = expanded.has(r.id);
          const displayText = isLong && !isExpanded ? r.review.substring(0, 200) + "..." : r.review;

          return (
            <div key={r.id} className="p-4 rounded-xl bg-surface-elevated/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${r.positive ? "text-success" : "text-error"}`}>
                    {r.positive ? "👍 Recommended" : "👎 Not Recommended"}
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  {r.playtimeHours}h played
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {displayText}
              </p>
              {isLong && (
                <button onClick={() => toggleExpand(r.id)} className="text-xs text-primary mt-2 hover:underline">
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
              <div className="flex items-center gap-4 mt-2">
                {r.votesUp > 0 && <span className="text-xs text-text-muted">👍 {r.votesUp} helpful</span>}
                {r.votesFunny > 0 && <span className="text-xs text-text-muted">😄 {r.votesFunny} funny</span>}
                <span className="text-xs text-text-muted">
                  {new Date(r.timestampCreated * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
