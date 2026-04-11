"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import TVShowDetailContent from "./TVShowDetailContent";
import { searchAndFetchPage } from "@/lib/services/fandom";

interface BriefingParams {
  showTitle: string;
  season: number;
  episode: number;
  episodeTitle: string;
}

interface TVShowModalContextType {
  openShow: (showId: string) => void;
  closeShow: () => void;
  openWikiArticle: (wikiSubdomain: string, pageTitle: string) => void;
  openBriefing: (params: BriefingParams) => void;
}

const TVShowModalContext = createContext<TVShowModalContextType>({
  openShow: () => {},
  closeShow: () => {},
  openWikiArticle: () => {},
  openBriefing: () => {},
});

export function useTVShowModal() {
  return useContext(TVShowModalContext);
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

function BriefingView({ params, onBack }: { params: BriefingParams; onBack: () => void }) {
  const [briefing, setBriefing] = useState<{ recap: string; characters: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `/api/tv/briefing?show=${encodeURIComponent(params.showTitle)}&season=${params.season}&episode=${params.episode}&episodeTitle=${encodeURIComponent(params.episodeTitle)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setBriefing(data);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-primary hover:text-primary-light transition mb-4">
        <span>←</span>
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">📋</span>
        <h2 className="text-xl font-bold">Episode Briefing</h2>
      </div>
      <p className="text-sm text-text-muted mb-6">
        {params.showTitle} · S{params.season} E{params.episode} — {params.episodeTitle}
      </p>

      {loading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted">Preparing your briefing...</p>
        </div>
      ) : error ? (
        <p className="text-error text-sm text-center py-8">{error}</p>
      ) : briefing ? (
        <div className="space-y-4">
          {/* Recap */}
          <div className="card-glass p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⏮️</span>
              <h3 className="font-bold text-sm">Previously on {params.showTitle}...</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{briefing.recap}</p>
          </div>

          {/* Characters */}
          <div className="card-glass p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">👥</span>
              <h3 className="font-bold text-sm">Characters to Watch</h3>
            </div>
            <div className="space-y-2">
              {briefing.characters.map((char, i) => {
                const [name, ...descParts] = char.split(" - ");
                const desc = descParts.join(" - ");
                return (
                  <div key={i} className="flex gap-2">
                    <span className="text-primary font-semibold text-sm shrink-0">{name}</span>
                    {desc && <span className="text-sm text-text-muted">— {desc}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-text-muted text-center pt-2">Spoiler-free · Generated by AI</p>
        </div>
      ) : null}
    </div>
  );
}

export function TVShowModalProvider({ children }: { children: React.ReactNode }) {
  const [activeShowId, setActiveShowId] = useState<string | null>(null);
  const [wikiView, setWikiView] = useState<{ wiki: string; page: string } | null>(null);
  const [briefingView, setBriefingView] = useState<BriefingParams | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPos = useRef(0);

  const openShow = useCallback((showId: string) => {
    setActiveShowId(showId);
    setWikiView(null);
    setBriefingView(null);
    document.body.style.overflow = "hidden";
    window.history.pushState({ tvModal: "show" }, "");
  }, []);

  const closeShow = useCallback(() => {
    setActiveShowId(null);
    setWikiView(null);
    setBriefingView(null);
    document.body.style.overflow = "";
  }, []);

  const openWikiArticle = useCallback((wikiSubdomain: string, pageTitle: string) => {
    savedScrollPos.current = scrollRef.current?.scrollTop ?? 0;
    setWikiView({ wiki: wikiSubdomain, page: pageTitle });
    setBriefingView(null);
    window.history.pushState({ tvModal: "wiki" }, "");
  }, []);

  const openBriefing = useCallback((params: BriefingParams) => {
    savedScrollPos.current = scrollRef.current?.scrollTop ?? 0;
    setBriefingView(params);
    setWikiView(null);
    window.history.pushState({ tvModal: "briefing" }, "");
  }, []);

  useEffect(() => {
    function handlePopState() {
      if (wikiView || briefingView) {
        setWikiView(null);
        setBriefingView(null);
      } else if (activeShowId) {
        setActiveShowId(null);
        document.body.style.overflow = "";
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeShowId, wikiView, briefingView]);

  const overlayView = wikiView || briefingView;

  return (
    <TVShowModalContext.Provider value={{ openShow, closeShow, openWikiArticle, openBriefing }}>
      {children}

      {activeShowId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={closeShow}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden border border-border/50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-surface-elevated flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border mx-auto sm:hidden" />
              <button
                onClick={closeShow}
                className="absolute right-2 top-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-surface-elevated border border-border hover:bg-error/20 hover:border-error/50 hover:text-error transition text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Detail view — always mounted, hidden when overlay is open */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4"
              style={{ display: overlayView ? "none" : undefined }}
            >
              <TVShowDetailContent showId={activeShowId} />
            </div>

            {/* Wiki view */}
            {wikiView && (
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <WikiArticleView
                  wiki={wikiView.wiki}
                  pageTitle={wikiView.page}
                  onBack={() => setWikiView(null)}
                />
              </div>
            )}

            {/* Briefing view */}
            {briefingView && (
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <BriefingView
                  params={briefingView}
                  onBack={() => setBriefingView(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </TVShowModalContext.Provider>
  );
}
