"use client";

import { useState } from "react";

// Placeholder gaming utility for Call of Duty: Black Ops 7.
// Renders only for the Black Ops 7 detail page; clicking opens a static
// preview of the upcoming Loadout Builder tool.
export default function LoadoutBuilderCard({ gameTitle }: { gameTitle: string }) {
  const [open, setOpen] = useState(false);

  const isBlackOps7 = /black ops 7/i.test(gameTitle);
  if (!isBlackOps7) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left block card-glass overflow-hidden hover:border-primary/40 transition group mb-6"
      >
        <div className="flex items-center gap-4 p-4">
          <div className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center text-3xl shrink-0">
            🔫
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light bg-primary/15 px-2 py-0.5 rounded-full">
                Gaming Utility
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-2 py-0.5 rounded-full">
                Preview
              </span>
            </div>
            <p className="font-semibold text-sm group-hover:text-primary transition line-clamp-1">
              Black Ops 7: Loadout Builder
            </p>
            <p className="text-[11px] text-text-muted">
              Build, tune, and save weapon loadouts with live stats & TTK
            </p>
          </div>
          <span className="text-primary text-lg shrink-0">→</span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto rounded-2xl border border-border/50 bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40 sticky top-0 bg-surface/95 backdrop-blur-xl z-10">
              <div className="min-w-0">
                <p className="font-bold text-base">Black Ops 7: Loadout Builder</p>
                <p className="text-xs text-text-secondary">Preview — coming soon</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/40 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <img
              src="/bo7-loadout-builder.png"
              alt="Black Ops 7 Loadout Builder preview"
              className="w-full block"
            />
          </div>
        </div>
      )}
    </>
  );
}
