"use client";

import { useState, useCallback, useMemo } from "react";

interface Perk {
  id: string;
  name: string;
  req: number;
  desc: string;
}

interface AttributeData {
  name: string;
  color: string;
  perks: Perk[];
}

const ATTRIBUTES: Record<string, AttributeData> = {
  body: {
    name: "Body",
    color: "text-red-400",
    perks: [
      { id: "b1", name: "Painkiller", req: 4, desc: "Unlocks in-combat health regen. The lower your health, the faster it regenerates." },
      { id: "b2", name: "Adrenaline Rush", req: 9, desc: "Activates Adrenaline Rush, granting you temporary health that absorbs damage." },
      { id: "b3", name: "Rip and Tear", req: 15, desc: "After hitting an enemy with a shotgun, you can perform a powerful melee follow-up." },
      { id: "b4", name: "Pain to Gain", req: 20, desc: "When Adrenaline Rush is active, using a Health Item provides a massive damage boost." },
    ],
  },
  reflexes: {
    name: "Reflexes",
    color: "text-cyan-400",
    perks: [
      { id: "r1", name: "Slippery", req: 4, desc: "The faster you move, the more difficult you are to hit." },
      { id: "r2", name: "Dash", req: 9, desc: "Replaces your dodge with a faster, more agile Dash." },
      { id: "r3", name: "Air Dash", req: 15, desc: "Unlocks the ability to perform a Dash while in mid-air." },
      { id: "r4", name: "Tailwind", req: 20, desc: "Each Dash performed in mid-air resets the Air Dash ability." },
    ],
  },
  technical: {
    name: "Technical Ability",
    color: "text-yellow-400",
    perks: [
      { id: "t1", name: "All Things Cyber", req: 4, desc: "Increases all cyberware stat modifiers by 10%." },
      { id: "t2", name: "Health Freak", req: 9, desc: "Improves recharge speed and effect of health items and grenades." },
      { id: "t3", name: "Edgerunner", req: 15, desc: "Allows you to exceed your cyberware capacity at a cost to your health." },
      { id: "t4", name: "License to Chrome", req: 20, desc: "Unlocks a new cyberware slot and further increases all cyberware stats." },
    ],
  },
  intelligence: {
    name: "Intelligence",
    color: "text-emerald-400",
    perks: [
      { id: "i1", name: "Eye in the Sky", req: 4, desc: "Automatically highlights nearby access points and cameras." },
      { id: "i2", name: "Overclock", req: 9, desc: "Allows you to use health to pay for quickhacks when out of RAM." },
      { id: "i3", name: "Spillover", req: 15, desc: "When you upload a quickhack, it can spread to an additional nearby target." },
      { id: "i4", name: "Queue Mastery", req: 20, desc: "Unlocks the ability to queue up to 4 quickhacks on a single enemy." },
    ],
  },
  cool: {
    name: "Cool",
    color: "text-blue-400",
    perks: [
      { id: "c1", name: "Feline Footwork", req: 4, desc: "Increases movement speed and mitigation chance while crouching." },
      { id: "c2", name: "Ninjutsu", req: 9, desc: "Increases crouch movement speed and unlocks silent takedowns from above." },
      { id: "c3", name: "Deadeye", req: 15, desc: "Unlocks Deadeye mode, increasing headshot and weakspot damage at the cost of stamina." },
      { id: "c4", name: "Nerves of Tungsten-Steel", req: 20, desc: "In Deadeye mode, all headshots are guaranteed critical hits." },
    ],
  },
};

const RECOMMENDED_BUILDS: Record<string, { label: string; attributes: Record<string, number>; perks: string[] }> = {
  netrunner: {
    label: "Ultimate Netrunner",
    attributes: { body: 6, reflexes: 15, technical: 20, intelligence: 20, cool: 20 },
    perks: ["i2", "i3", "i4", "t3", "t4", "c3", "c4", "r3"],
  },
  samurai: {
    label: "Cyber-Samurai",
    attributes: { body: 20, reflexes: 20, technical: 18, intelligence: 3, cool: 20 },
    perks: ["r3", "r4", "b2", "b3", "b4", "c3", "c4", "t3"],
  },
  solo: {
    label: "Unkillable Solo",
    attributes: { body: 20, reflexes: 20, technical: 20, intelligence: 3, cool: 18 },
    perks: ["b2", "b4", "r2", "r4", "t1", "t3", "t4", "c3"],
  },
  ninja: {
    label: "Stealth Ninja",
    attributes: { body: 15, reflexes: 20, technical: 18, intelligence: 8, cool: 20 },
    perks: ["c1", "c2", "c4", "r3", "r4", "t3"],
  },
};

const MAX_LEVEL = 60;
const BASE_ATTR = 3;
const BASE_ATTR_POINTS = 7;

function defaultAttributes() {
  return { body: BASE_ATTR, reflexes: BASE_ATTR, technical: BASE_ATTR, intelligence: BASE_ATTR, cool: BASE_ATTR };
}

export default function Cyberpunk2077BuildPlanner({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState(1);
  const [attributes, setAttributes] = useState<Record<string, number>>(defaultAttributes);
  const [unlockedPerks, setUnlockedPerks] = useState<Set<string>>(new Set());
  const [expandedAttr, setExpandedAttr] = useState<string | null>(null);

  const spentAttrPoints = useMemo(
    () => Object.values(attributes).reduce((sum, v) => sum + (v - BASE_ATTR), 0),
    [attributes],
  );
  const totalAttrPoints = BASE_ATTR_POINTS + (level - 1);
  const availableAttrPoints = totalAttrPoints - spentAttrPoints;
  const availablePerkPoints = level - unlockedPerks.size;

  const changeLevel = useCallback((delta: number) => {
    setLevel((prev) => {
      const next = prev + delta;
      if (next < 1 || next > MAX_LEVEL) return prev;
      return next;
    });
  }, []);

  const changeAttribute = useCallback((key: string, delta: number) => {
    setAttributes((prev) => {
      const cur = prev[key];
      const next = cur + delta;
      if (next < BASE_ATTR || next > 20) return prev;
      if (delta > 0 && availableAttrPoints <= 0) return prev;
      const updated = { ...prev, [key]: next };
      // Refund perks that no longer meet requirements
      if (delta < 0) {
        setUnlockedPerks((perks) => {
          const nextPerks = new Set(perks);
          for (const perk of ATTRIBUTES[key].perks) {
            if (perk.req > next) nextPerks.delete(perk.id);
          }
          return nextPerks;
        });
      }
      return updated;
    });
  }, [availableAttrPoints]);

  const togglePerk = useCallback((perkId: string, attrKey: string, req: number) => {
    setUnlockedPerks((prev) => {
      const next = new Set(prev);
      if (next.has(perkId)) {
        next.delete(perkId);
      } else {
        if (attributes[attrKey] >= req && availablePerkPoints > 0) {
          next.add(perkId);
        }
      }
      return next;
    });
  }, [attributes, availablePerkPoints]);

  const reset = useCallback(() => {
    setLevel(1);
    setAttributes(defaultAttributes());
    setUnlockedPerks(new Set());
    setExpandedAttr(null);
  }, []);

  const loadBuild = useCallback((key: string) => {
    const build = RECOMMENDED_BUILDS[key];
    if (!build) return;
    setLevel(MAX_LEVEL);
    setAttributes({ ...build.attributes });
    setUnlockedPerks(new Set(build.perks));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onClose} className="text-text-muted hover:text-foreground transition text-sm">
            ← Back
          </button>
          <h2 className="font-bold text-sm">Build Planner</h2>
          <button onClick={reset} className="text-error text-sm font-medium">
            Reset
          </button>
        </div>
      </div>

      <div className="px-4 pb-24 max-w-lg mx-auto">
        {/* Stats summary */}
        <div className="card-glass p-4 mt-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">Character Level</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeLevel(-1)}
                disabled={level <= 1}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-border text-sm font-bold disabled:opacity-30 transition"
              >
                -
              </button>
              <span className="text-xl font-bold text-primary w-8 text-center">{level}</span>
              <button
                onClick={() => changeLevel(1)}
                disabled={level >= MAX_LEVEL}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-border text-sm font-bold disabled:opacity-30 transition"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-surface-elevated rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-0.5">Attr Points</p>
              <p className={`text-lg font-bold ${availableAttrPoints > 0 ? "text-primary" : "text-text-muted"}`}>
                {availableAttrPoints}
              </p>
            </div>
            <div className="flex-1 bg-surface-elevated rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-0.5">Perk Points</p>
              <p className={`text-lg font-bold ${availablePerkPoints > 0 ? "text-primary" : "text-text-muted"}`}>
                {availablePerkPoints}
              </p>
            </div>
          </div>
        </div>

        {/* Recommended builds */}
        <div className="mb-4">
          <p className="text-xs text-text-muted mb-2 px-1">Recommended Builds</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {Object.entries(RECOMMENDED_BUILDS).map(([key, build]) => (
              <button
                key={key}
                onClick={() => loadBuild(key)}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium hover:border-primary/50 hover:text-primary transition"
              >
                {build.label}
              </button>
            ))}
          </div>
        </div>

        {/* Attributes */}
        <div className="space-y-2">
          {Object.entries(ATTRIBUTES).map(([key, attr]) => {
            const isExpanded = expandedAttr === key;
            const attrLevel = attributes[key];
            const unlockedCount = attr.perks.filter((p) => unlockedPerks.has(p.id)).length;

            return (
              <div key={key} className="card-glass overflow-hidden">
                {/* Attribute row */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => setExpandedAttr(isExpanded ? null : key)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${attr.color}`}>{attr.name}</span>
                        {unlockedCount > 0 && (
                          <span className="text-[10px] text-xp bg-xp/15 px-1.5 py-0.5 rounded-full font-medium">
                            {unlockedCount} perk{unlockedCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xl font-bold w-8 text-center">{attrLevel}</span>
                    <svg
                      className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => changeAttribute(key, -1)}
                      disabled={attrLevel <= BASE_ATTR}
                      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border text-sm font-bold disabled:opacity-30 transition"
                    >
                      -
                    </button>
                    <button
                      onClick={() => changeAttribute(key, 1)}
                      disabled={attrLevel >= 20 || availableAttrPoints <= 0}
                      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border text-sm font-bold disabled:opacity-30 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Perks (expandable) */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-4 py-3 space-y-2 bg-surface-elevated/30">
                    {attr.perks.map((perk) => {
                      const isUnlocked = unlockedPerks.has(perk.id);
                      const meetsReq = attrLevel >= perk.req;
                      const canUnlock = meetsReq && availablePerkPoints > 0;

                      return (
                        <button
                          key={perk.id}
                          onClick={() => togglePerk(perk.id, key, perk.req)}
                          disabled={!isUnlocked && !canUnlock}
                          className={`w-full text-left rounded-xl p-3 border transition ${
                            isUnlocked
                              ? "bg-xp/10 border-xp/40"
                              : canUnlock
                                ? "bg-surface border-primary/30 hover:border-primary/60"
                                : "bg-surface/50 border-border/30 opacity-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm font-semibold ${isUnlocked ? "text-xp" : ""}`}>
                              {perk.name}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              meetsReq ? "text-success bg-success/15" : "text-text-muted bg-surface-elevated"
                            }`}>
                              REQ: {perk.req}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">{perk.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
