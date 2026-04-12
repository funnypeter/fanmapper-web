"use client";

import { useState, useEffect } from "react";
import PollCard from "./PollCard";
import PollModal from "./PollModal";
import type { PollData } from "./PollCard";

export default function PollCarousel({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const [polls, setPolls] = useState<PollData[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/polls")
      .then((r) => r.json())
      .then((data) => {
        setPolls(data.polls ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleVoted(pollId: string, votes: number[], totalVotes: number, userVote: number) {
    setPolls((prev) =>
      prev.map((p) =>
        p.id === pollId ? { ...p, votes, totalVotes, userVote } : p
      )
    );
    setSelectedPoll((prev) =>
      prev?.id === pollId ? { ...prev, votes, totalVotes, userVote } : prev
    );
  }

  if (loading || polls.length === 0) return null;

  return (
    <div className={hideHeader ? "" : "mb-12"}>
      {!hideHeader && (
        <>
          <h3 className="text-xl font-bold mb-2">Community Polls</h3>
          <p className="text-text-secondary text-sm mb-5">
            Vote on this week&apos;s hot topics
          </p>
        </>
      )}

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {polls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            onSelect={(p) => setSelectedPoll(p)}
          />
        ))}
      </div>

      {selectedPoll && (
        <PollModal
          poll={selectedPoll}
          onClose={() => setSelectedPoll(null)}
          onVoted={handleVoted}
        />
      )}
    </div>
  );
}
