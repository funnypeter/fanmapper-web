import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTVPolls } from "@/lib/services/tvPollGenerator";

async function fetchActivePolls(supabase: Awaited<ReturnType<typeof createClient>>, userId: string | null) {
  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .eq("category", "tv")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(4);

  if (!polls || polls.length === 0) return [];

  const pollIds = polls.map((p) => p.id);
  const { data: votes } = await supabase
    .from("poll_votes")
    .select("poll_id, selected_option, user_id")
    .in("poll_id", pollIds);

  return polls.map((poll) => {
    const pollVotes = (votes ?? []).filter((v) => v.poll_id === poll.id);
    const options = poll.options as string[];
    const voteCounts = options.map(
      (_, i) => pollVotes.filter((v) => v.selected_option === i).length
    );
    const userVote = userId
      ? pollVotes.find((v) => v.user_id === userId)?.selected_option ?? null
      : null;

    return {
      id: poll.id,
      question: poll.question,
      options,
      imageUrl: poll.image_url,
      gameHint: poll.game_hint,
      votes: voteCounts,
      totalVotes: pollVotes.length,
      userVote,
      expiresAt: poll.expires_at,
    };
  });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? null;

    let polls = await fetchActivePolls(supabase, userId);

    if (polls.length === 0) {
      const { success, error: genError } = await generateTVPolls();
      if (success) {
        polls = await fetchActivePolls(supabase, userId);
      } else if (genError) {
        return NextResponse.json({ polls: [], debug: genError });
      }
    }

    return NextResponse.json({ polls });
  } catch (err) {
    return NextResponse.json({ polls: [], debug: String(err) });
  }
}
