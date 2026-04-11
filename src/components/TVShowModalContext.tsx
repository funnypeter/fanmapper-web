"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import TVShowDetailContent from "./TVShowDetailContent";
import { TV_SHOW_REGISTRY } from "@/lib/services/tvRegistry";
import { findTVWikiConfigByTmdbId } from "@/lib/services/tvRegistry";
import { fetchPage } from "@/lib/services/fandom";

interface TVShowModalContextType {
  openShow: (showId: string) => void;
  closeShow: () => void;
  openEpisodeWiki: (episodeTitle: string) => void;
}

const TVShowModalContext = createContext<TVShowModalContextType>({
  openShow: () => {},
  closeShow: () => {},
  openEpisodeWiki: () => {},
});

export function useTVShowModal() {
  return useContext(TVShowModalContext);
}

function WikiArticleView({ wiki, pageTitle, onBack }: { wiki: string; pageTitle: string; onBack: () => void }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage(wiki, pageTitle).then((data) => {
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
        <span className="text-sm font-medium">Back to episodes</span>
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
        <p className="text-text-secondary text-center py-8">No wiki content available for this episode.</p>
      )}
    </div>
  );
}

export function TVShowModalProvider({ children }: { children: React.ReactNode }) {
  const [activeShowId, setActiveShowId] = useState<string | null>(null);
  const [wikiArticle, setWikiArticle] = useState<string | null>(null);

  const openShow = useCallback((showId: string) => {
    setActiveShowId(showId);
    setWikiArticle(null);
    document.body.style.overflow = "hidden";
    window.history.pushState({ tvModal: "show" }, "");
  }, []);

  const closeShow = useCallback(() => {
    setActiveShowId(null);
    setWikiArticle(null);
    document.body.style.overflow = "";
  }, []);

  const openEpisodeWiki = useCallback((episodeTitle: string) => {
    setWikiArticle(episodeTitle);
    window.history.pushState({ tvModal: "wiki" }, "");
  }, []);

  // Handle Android back button / browser back
  useEffect(() => {
    function handlePopState() {
      if (wikiArticle) {
        setWikiArticle(null);
      } else if (activeShowId) {
        setActiveShowId(null);
        document.body.style.overflow = "";
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeShowId, wikiArticle]);

  const registryMatch = activeShowId ? findTVWikiConfigByTmdbId(activeShowId) : null;
  const wikiSubdomain = registryMatch?.config.wiki ?? null;

  return (
    <TVShowModalContext.Provider value={{ openShow, closeShow, openEpisodeWiki }}>
      {children}

      {activeShowId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={closeShow}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden border border-border/50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-surface-elevated flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border mx-auto sm:hidden" />
              <button
                onClick={closeShow}
                className="absolute right-2 top-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-surface-elevated border border-border hover:bg-error/20 hover:border-error/50 hover:text-error transition text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              {wikiArticle && wikiSubdomain ? (
                <WikiArticleView
                  wiki={wikiSubdomain}
                  pageTitle={wikiArticle}
                  onBack={() => setWikiArticle(null)}
                />
              ) : (
                <TVShowDetailContent showId={activeShowId} />
              )}
            </div>
          </div>
        </div>
      )}
    </TVShowModalContext.Provider>
  );
}
