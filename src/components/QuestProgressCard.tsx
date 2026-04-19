"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useGameModal } from "@/components/GameModalContext";

interface Quest {
  title: string;
  url: string;
}

type QuestsData = Record<string, Quest[]>;

// Simple string hash to generate a stable numeric page_id from quest title
// (the wiki_progress table has unique constraint on user_id, game_key, page_id)
function hashTitle(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function toGameDataKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Extract wiki subdomain + page title from a Fandom URL
// e.g. "https://cyberpunk.fandom.com/wiki/The_Rescue" -> { wiki: "cyberpunk", page: "The_Rescue" }
function parseFandomUrl(url: string): { wiki: string; page: string } | null {
  try {
    const parsed = new URL(url);
    const match = parsed.hostname.match(/^([^.]+)\.fandom\.com$/);
    if (!match) return null;
    const page = parsed.pathname.replace(/^\/wiki\//, "");
    return { wiki: match[1], page: decodeURIComponent(page) };
  } catch {
    return null;
  }
}

export default function QuestProgressCard({
  gameTitle,
  gameKey,
}: {
  gameTitle: string;
  gameKey: string;
}) {
  const { openWikiArticle } = useGameModal();
  const [quests, setQuests] = useState<QuestsData | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(`fancompanion-quests-${gameKey}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [expanded, setExpanded] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // Fetch quest data
  useEffect(() => {
    const key = toGameDataKey(gameTitle);
    fetch(`https://game-data-two.vercel.app/game/${key}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        if (data.quests && Object.keys(data.quests).length > 0) {
          setQuests(data.quests);
        }
      })
      .catch(() => {});
  }, [gameTitle]);

  // Load progress from Supabase on mount
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("wiki_progress")
        .select("page_title")
        .eq("user_id", user.id)
        .eq("game_key", `quest-${gameKey}`);
      if (data && data.length > 0) {
        const titles = new Set<string>(data.filter((r: { page_title: string | null }) => r.page_title).map((r: { page_title: string }) => r.page_title));
        setCompleted(titles);
        localStorage.setItem(`fancompanion-quests-${gameKey}`, JSON.stringify([...titles]));
      }
    })();
  }, [gameKey, supabase]);

  const toggleQuest = useCallback(
    async (questTitle: string) => {
      const wasCompleted = completed.has(questTitle);
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(questTitle)) next.delete(questTitle);
        else next.add(questTitle);
        localStorage.setItem(`fancompanion-quests-${gameKey}`, JSON.stringify([...next]));
        return next;
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const pageId = hashTitle(questTitle);
      if (wasCompleted) {
        await supabase
          .from("wiki_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("game_key", `quest-${gameKey}`)
          .eq("page_id", pageId);
      } else {
        await supabase.from("wiki_progress").upsert(
          {
            user_id: user.id,
            game_key: `quest-${gameKey}`,
            page_id: pageId,
            page_title: questTitle,
          },
          { onConflict: "user_id,game_key,page_id" },
        );
      }
    },
    [gameKey, completed, supabase],
  );

  if (!quests) return null;

  // Flatten all quests in order
  const allQuests: Quest[] = [];
  for (const section of Object.values(quests)) {
    allQuests.push(...section);
  }
  const totalCount = allQuests.length;
  const completedCount = allQuests.filter((q) => completed.has(q.title)).length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find first uncompleted quest
  const nextQuest = allQuests.find((q) => !completed.has(q.title));
  const nextQuestParsed = nextQuest ? parseFandomUrl(nextQuest.url) : null;

  return (
    <div className="card-glass overflow-hidden mb-6">
      {/* Compact card */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📜</span>
            <h3 className="font-semibold text-sm">Main Quest Progress</h3>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary font-medium hover:text-primary/80 transition flex items-center gap-1"
          >
            {expanded ? "Hide" : "All Quests"}
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-2.5 rounded-full bg-surface-elevated overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs text-text-muted whitespace-nowrap font-medium">
            {completedCount}/{totalCount} ({percent}%)
          </span>
        </div>

        {/* Continue with next quest */}
        {nextQuest && (
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Continue with</p>
            <button
              onClick={() => {
                const parsed = nextQuestParsed;
                if (parsed) openWikiArticle(parsed.wiki, parsed.page);
                else window.open(nextQuest.url, "_blank");
              }}
              className="flex items-center gap-2 group text-left"
            >
              <span className="text-sm font-medium group-hover:text-primary transition truncate">
                {nextQuest.title}
              </span>
              <span className="text-primary text-xs shrink-0">→</span>
            </button>
          </div>
        )}
        {completedCount === totalCount && totalCount > 0 && (
          <p className="text-sm text-success font-medium">All quests completed!</p>
        )}
      </div>

      {/* Expanded quest list */}
      {expanded && (
        <div className="border-t border-border/50 max-h-[60vh] overflow-y-auto">
          {Object.entries(quests).map(([section, sectionQuests]) => {
            const sectionCompleted = sectionQuests.filter((q) => completed.has(q.title)).length;
            return (
              <div key={section}>
                <div className="sticky top-0 bg-surface-elevated/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {section}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {sectionCompleted}/{sectionQuests.length}
                  </span>
                </div>
                {sectionQuests.map((quest) => {
                  const isCompleted = completed.has(quest.title);
                  const parsed = parseFandomUrl(quest.url);

                  return (
                    <div
                      key={quest.title}
                      className={`flex items-center gap-3 px-4 py-2.5 border-b border-border/30 transition ${isCompleted ? "opacity-60" : ""}`}
                    >
                      <button
                        onClick={() => toggleQuest(quest.title)}
                        className={`shrink-0 w-5 h-5 rounded flex items-center justify-center transition ${
                          isCompleted ? "bg-success/20" : "border-2 border-text-muted hover:border-primary"
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (parsed) openWikiArticle(parsed.wiki, parsed.page);
                          else window.open(quest.url, "_blank");
                        }}
                        className={`flex-1 text-sm min-w-0 truncate transition text-left ${isCompleted ? "line-through text-text-muted" : "hover:text-primary"}`}
                      >
                        {quest.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
