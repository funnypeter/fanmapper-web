import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { pollId, selectedOption } = await request.json();

    if (!pollId || selectedOption === undefined || selectedOption === null) {
      return NextResponse.json({ error: "Missing pollId or selectedOption" }, { status: 400 });
    }

    // Check poll exists and is active
    const { data: poll } = await supabase
      .from("polls")
      .select("id, options, expires_at")
      .eq("id", pollId)
      .single();

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: "Poll has expired" }, { status: 400 });
    }

    const options = poll.options as string[];
    if (selectedOption < 0 || selectedOption >= options.length) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    // Upsert vote (allows changing vote)
    const { error: voteError } = await supabase
      .from("poll_votes")
      .upsert(
        {
          poll_id: pollId,
          user_id: user.id,
          selected_option: selectedOption,
        },
        { onConflict: "poll_id,user_id" }
      );

    if (voteError) {
      return NextResponse.json({ error: "Failed to save vote" }, { status: 500 });
    }

    // Return updated vote counts
    const { data: allVotes } = await supabase
      .from("poll_votes")
      .select("selected_option")
      .eq("poll_id", pollId);

    const voteCounts = options.map(
      (_, i) => (allVotes ?? []).filter((v) => v.selected_option === i).length
    );

    return NextResponse.json({
      votes: voteCounts,
      totalVotes: (allVotes ?? []).length,
      userVote: selectedOption,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
