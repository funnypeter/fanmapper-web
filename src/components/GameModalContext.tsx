"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import GameDetailContent from "./GameDetailContent";
import { searchAndFetchPage } from "@/lib/services/fandom";

interface GameModalContextType {
  openGame: (gameId: string) => void;
  closeGame: () => void;
  openWikiArticle: (wikiSubdomain: string, pageTitle: string) => void;
}

const GameModalContext = createContext<GameModalContextType>({
  openGame: () => {},
  closeGame: () => {},
  openWikiArticle: () => {},
});

export function useGameModal() {
  return useContext(GameModalContext);
}

function WikiArticleView({ wiki, pageTitle, onBack }: { wiki: string; pageTitle: string; onBack: () => void }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchAndFetchPage(wiki, pageTitle).then((data) => {
      if (data?.html) {
        let html = data.html;
        html = html.replace(/\s+src="data:image[^"]*"/g, "");
        html = html.replace(/data-src="/g, 'src="');
        html = html.replace(/\s+srcset="[^"]*"/g, "");
        html = html.replace(/src="(https:\/\/static\.wikia\.nocookie\.net[^"]*)"/g,
          (_: string, url: string) => `src="/api/img?url=${encodeURIComponent(url)}"`
        );
        setContent(html);
      }
      setLoading(false);
    });
  }, [wiki, pageTitle]);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-primary hover:text-primary-light transition mb-4">
        <span>←</span>
        <span className="text-sm font-medium">Back</span>
      </button>
      <h2 className="text-2xl font-bold mb-4">{pageTitle}</h2>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : content ? (
        <div className="card-glass p-5 overflow-hidden">
          <div className="wiki-content" dangerouslySetInnerHTML={{ __html: content }} />
          <div className="border-t border-border mt-6 pt-4">
            <p className="text-[10px] text-text-muted">
              Content from {wiki}.fandom.com — Licensed under CC BY-SA 3.0
            </p>
          </div>
        </div>
      ) : (
        <p className="text-text-secondary text-center py-8">No wiki content available.</p>
      )}
    </div>
  );
}

export function GameModalProvider({ children }: { children: React.ReactNode }) {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [wikiView, setWikiView] = useState<{ wiki: string; page: string } | null>(null);
  const pathname = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPos = useRef(0);

  // Track pathname changes to auto-close
  const currentPathname = (() => {
    try {
      return typeof window !== "undefined" ? window.location.pathname : null;
    } catch { return null; }
  })();

  useEffect(() => {
    if (pathname.current !== null && currentPathname !== pathname.current) {
      if (activeGameId) {
        setActiveGameId(null);
        setWikiView(null);
        document.body.style.overflow = "";
      }
    }
    pathname.current = currentPathname;
  }, [currentPathname, activeGameId]);

  const openGame = useCallback((gameId: string) => {
    setActiveGameId(gameId);
    setWikiView(null);
    document.body.style.overflow = "hidden";
    window.history.pushState({ gameModal: true }, "");
  }, []);

  const closeGame = useCallback(() => {
    setActiveGameId(null);
    setWikiView(null);
    document.body.style.overflow = "";
  }, []);

  const openWikiArticle = useCallback((wikiSubdomain: string, pageTitle: string) => {
    savedScrollPos.current = scrollRef.current?.scrollTop ?? 0;
    setWikiView({ wiki: wikiSubdomain, page: pageTitle });
    window.history.pushState({ gameModal: "wiki" }, "");
  }, []);

  useEffect(() => {
    function handlePopState() {
      if (wikiView) {
        setWikiView(null);
      } else if (activeGameId) {
        setActiveGameId(null);
        setWikiView(null);
        document.body.style.overflow = "";
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeGameId, wikiView]);

  return (
    <GameModalContext.Provider value={{ openGame, closeGame, openWikiArticle }}>
      {children}

      {activeGameId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={closeGame}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden border border-border/50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-surface-elevated flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border mx-auto sm:hidden" />
              <button
                onClick={closeGame}
                className="absolute right-2 top-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-surface-elevated border border-border hover:bg-error/20 hover:border-error/50 hover:text-error transition text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Detail view — always mounted, hidden when wiki overlay is open */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4"
              style={{ display: wikiView ? "none" : undefined }}
            >
              <GameDetailContent gameId={activeGameId} />
            </div>

            {/* Wiki article view */}
            {wikiView && (
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <WikiArticleView
                  wiki={wikiView.wiki}
                  pageTitle={wikiView.page}
                  onBack={() => setWikiView(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </GameModalContext.Provider>
  );
}
