"use client";

import { createContext, useContext, useState, useCallback } from "react";
import GameDetailContent from "./GameDetailContent";

interface GameModalContextType {
  openGame: (gameId: string) => void;
  closeGame: () => void;
}

const GameModalContext = createContext<GameModalContextType>({
  openGame: () => {},
  closeGame: () => {},
});

export function useGameModal() {
  return useContext(GameModalContext);
}

export function GameModalProvider({ children }: { children: React.ReactNode }) {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const openGame = useCallback((gameId: string) => {
    setActiveGameId(gameId);
    document.body.style.overflow = "hidden";
  }, []);

  const closeGame = useCallback(() => {
    setActiveGameId(null);
    document.body.style.overflow = "";
  }, []);

  return (
    <GameModalContext.Provider value={{ openGame, closeGame }}>
      {children}

      {activeGameId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={closeGame}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden border border-border/50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-surface-elevated/50 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border mx-auto sm:hidden" />
              <button
                onClick={closeGame}
                className="absolute right-3 top-2 text-text-muted hover:text-foreground transition text-xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <GameDetailContent gameId={activeGameId} />
            </div>
          </div>
        </div>
      )}
    </GameModalContext.Provider>
  );
}
