"use client";

import { useState } from "react";
import type { PollData } from "./PollCard";

interface PollModalProps {
  poll: PollData;
  onClose: () => void;
  onVoted: (pollId: string, votes: number[], totalVotes: number, userVote: number) => void;
}

export default function PollModal({ poll, onClose, onVoted }: PollModalProps) {
  const [voting, setVoting] = useState(false);
  const [localUserVote, setLocalUserVote] = useState<number | null>(poll.userVote);
  const [localVotes, setLocalVotes] = useState(poll.votes);
  const [localTotal, setLocalTotal] = useState(poll.totalVotes);
  const [error, setError] = useState<string | null>(null);

  const hasVoted = localUserVote !== null;
  const maxVotes = Math.max(...localVotes, 1);

  async function handleVote(optionIndex: number) {
    setVoting(true);
    setError(null);

    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, selectedOption: optionIndex }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          setError("Sign in to vote");
        } else {
          setError(data.error || "Failed to vote");
        }
        setVoting(false);
        return;
      }

      const data = await res.json();
      setLocalUserVote(data.userVote);
      setLocalVotes(data.votes);
      setLocalTotal(data.totalVotes);
      onVoted(poll.id, data.votes, data.totalVotes, data.userVote);
    } catch {
      setError("Something went wrong");
    }
    setVoting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background artwork */}
        {poll.imageUrl ? (
          <img
            src={poll.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/60" />

        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Community Poll
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-foreground transition text-xl leading-none p-1"
            >
              &times;
            </button>
          </div>

          {poll.gameHint && (
            <p className="text-xs text-text-muted mb-3">{poll.gameHint}</p>
          )}

          {/* Question */}
          <h3 className="text-lg font-bold text-foreground mb-5 leading-snug">
            {poll.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {poll.options.map((option, i) => {
              const pct = localTotal > 0 ? Math.round((localVotes[i] / localTotal) * 100) : 0;
              const isSelected = localUserVote === i;
              const isLeading = localVotes[i] === maxVotes && localTotal > 0;

              return (
                <button
                  key={i}
                  onClick={() => !voting && handleVote(i)}
                  disabled={voting}
                  className={`w-full text-left rounded-xl p-3 border transition-all relative overflow-hidden ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : hasVoted
                        ? "border-border/50 bg-surface-elevated/50"
                        : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  } ${voting ? "opacity-50" : ""}`}
                >
                  {/* Vote bar background */}
                  {hasVoted && (
                    <div
                      className={`absolute inset-0 transition-all duration-500 ${
                        isLeading ? "bg-accent/15" : "bg-white/5"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  )}

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="text-accent text-sm">&#10003;</span>
                      )}
                      <span className={`text-sm font-medium ${isSelected ? "text-accent" : "text-foreground"}`}>
                        {option}
                      </span>
                    </div>
                    {hasVoted && (
                      <span className={`text-sm font-semibold ml-2 ${isLeading ? "text-accent" : "text-text-secondary"}`}>
                        {pct}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <p className="text-error text-sm mt-3 text-center">{error}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-text-muted">
              {localTotal} {localTotal === 1 ? "vote" : "votes"}
            </p>
            {hasVoted && (
              <p className="text-xs text-text-muted">
                Tap another option to change your vote
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
