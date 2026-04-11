"use client";

export interface PollData {
  id: string;
  question: string;
  options: string[];
  imageUrl: string | null;
  gameHint: string | null;
  votes: number[];
  totalVotes: number;
  userVote: number | null;
  expiresAt: string;
}

interface PollCardProps {
  poll: PollData;
  onSelect: (poll: PollData) => void;
}

export default function PollCard({ poll, onSelect }: PollCardProps) {
  const maxVotes = Math.max(...poll.votes, 1);

  return (
    <button
      onClick={() => onSelect(poll)}
      className="relative flex-shrink-0 w-[280px] rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 text-left cursor-pointer group"
    >
      {/* Background artwork */}
      {poll.imageUrl ? (
        <img
          src={poll.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content */}
      <div className="relative p-4 h-full flex flex-col min-h-[220px]">
        {/* Poll badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
            Live Poll
          </span>
        </div>

        {/* Question */}
        <h4 className="text-sm font-bold text-white leading-snug mb-4 line-clamp-2">
          {poll.question}
        </h4>

        {/* Vote bars */}
        <div className="mt-auto space-y-2">
          {poll.options.map((option, i) => {
            const pct = poll.totalVotes > 0 ? Math.round((poll.votes[i] / poll.totalVotes) * 100) : 0;
            const isUserChoice = poll.userVote === i;
            const isLeading = poll.votes[i] === maxVotes && poll.totalVotes > 0;

            return (
              <div key={i} className="relative">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className={`truncate mr-2 ${isUserChoice ? "text-accent font-semibold" : "text-white/80"}`}>
                    {isUserChoice && <span className="mr-1">&#10003;</span>}
                    {option}
                  </span>
                  {poll.totalVotes > 0 && (
                    <span className={`flex-shrink-0 ${isLeading ? "text-accent font-semibold" : "text-white/50"}`}>
                      {pct}%
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isLeading ? "bg-accent" : "bg-primary/60"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total votes */}
        <p className="text-[10px] text-white/40 mt-3">
          {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
        </p>
      </div>
    </button>
  );
}
