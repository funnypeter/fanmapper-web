"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  displayName: string;
}

export default function ReviewSection({ gameId, isLoggedIn, isInLibrary }: { gameId: string; isLoggedIn: boolean; isInLibrary: boolean }) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formBody, setFormBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [gameId]);

  async function loadReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*, profile:profiles(display_name)")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .limit(20);

    setReviews((data ?? []).map((r: any) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      createdAt: r.created_at,
      displayName: r.profile?.display_name ?? "Anonymous",
    })));
    setLoading(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("reviews").upsert({
      user_id: user.id,
      game_id: gameId,
      rating: formRating,
      body: formBody,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,game_id" });

    setShowForm(false);
    setFormBody("");
    setSubmitting(false);
    loadReviews();
  }

  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Reviews</h3>
        {isLoggedIn && isInLibrary && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2">
            Write Review
          </button>
        )}
      </div>

      {/* Write form */}
      {showForm && (
        <div className="mb-6 p-4 rounded-xl bg-surface-elevated border border-border">
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setFormRating(n)} className="text-2xl" style={{ color: n <= formRating ? "#FDCB6E" : "#484F58" }}>★</button>
            ))}
          </div>
          <textarea
            value={formBody}
            onChange={(e) => setFormBody(e.target.value)}
            placeholder="What did you think of this game?"
            rows={4}
            className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/50"
          />
          <div className="flex gap-2 mt-3">
            <button onClick={handleSubmit} disabled={submitting || !formBody.trim()} className="btn-primary text-sm px-4 py-2">
              {submitting ? "Posting..." : "Post Review"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-text-muted px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-text-muted text-sm">Loading...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl">💬</span>
          <p className="text-text-secondary mt-3">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-surface-elevated/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {r.displayName[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{r.displayName}</span>
                </div>
                <span className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="text-sm" style={{ color: n <= r.rating ? "#FDCB6E" : "#484F58" }}>★</span>
                ))}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
