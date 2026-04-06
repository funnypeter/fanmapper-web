import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ appid: string }> }) {
  const { appid } = await params;

  try {
    const res = await fetch(
      `https://store.steampowered.com/appreviews/${appid}?json=1&num_per_page=10&language=english&filter=updated&review_type=all&purchase_type=all`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) return NextResponse.json({ reviews: [], summary: null });

    const data = await res.json();

    const summary = data.query_summary ? {
      totalReviews: data.query_summary.total_reviews,
      totalPositive: data.query_summary.total_positive,
      totalNegative: data.query_summary.total_negative,
      reviewScore: data.query_summary.review_score_desc,
    } : null;

    const reviews = (data.reviews ?? []).map((r: any) => ({
      id: r.recommendationid,
      positive: r.voted_up,
      review: r.review,
      playtimeHours: Math.round((r.author?.playtime_forever ?? 0) / 60),
      votesUp: r.votes_up,
      votesFunny: r.votes_funny,
      timestampCreated: r.timestamp_created,
      author: r.author?.steamid,
    }));

    return NextResponse.json({ reviews, summary });
  } catch {
    return NextResponse.json({ reviews: [], summary: null });
  }
}
