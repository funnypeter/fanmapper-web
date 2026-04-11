"use client";

import { createContext, useContext, useState, useCallback } from "react";
import TVShowDetailContent from "./TVShowDetailContent";

interface TVShowModalContextType {
  openShow: (showId: string) => void;
  closeShow: () => void;
}

const TVShowModalContext = createContext<TVShowModalContextType>({
  openShow: () => {},
  closeShow: () => {},
});

export function useTVShowModal() {
  return useContext(TVShowModalContext);
}

export function TVShowModalProvider({ children }: { children: React.ReactNode }) {
  const [activeShowId, setActiveShowId] = useState<string | null>(null);

  const openShow = useCallback((showId: string) => {
    setActiveShowId(showId);
    document.body.style.overflow = "hidden";
  }, []);

  const closeShow = useCallback(() => {
    setActiveShowId(null);
    document.body.style.overflow = "";
  }, []);

  return (
    <TVShowModalContext.Provider value={{ openShow, closeShow }}>
      {children}

      {activeShowId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={closeShow}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden border border-border/50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-surface-elevated/50 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border mx-auto sm:hidden" />
              <button onClick={closeShow} className="absolute right-3 top-2 text-text-muted hover:text-foreground transition text-xl leading-none p-1">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <TVShowDetailContent showId={activeShowId} />
            </div>
          </div>
        </div>
      )}
    </TVShowModalContext.Provider>
  );
}
