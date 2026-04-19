"use client";

import { useState } from "react";
import Cyberpunk2077BuildPlanner from "@/components/Cyberpunk2077BuildPlanner";

export default function BuildPlannerCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full card-glass p-5 flex items-center gap-4 hover:border-primary/30 transition group mb-6 text-left"
      >
        <div className="w-11 h-11 rounded-xl bg-error/15 flex items-center justify-center text-xl shrink-0">
          🧬
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm group-hover:text-primary transition">Build Planner</p>
          <p className="text-xs text-text-muted">Plan your attributes & perks</p>
        </div>
        <span className="text-primary">→</span>
      </button>

      {open && <Cyberpunk2077BuildPlanner onClose={() => setOpen(false)} />}
    </>
  );
}
