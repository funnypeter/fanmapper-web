"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  user: string;
  text: string;
  color: string;
}

interface ChatRoom {
  game: string;
  title: string;
  viewers: number;
  messages: ChatMessage[];
}

const COLORS = ["#6C5CE7", "#00CEC9", "#FDCB6E", "#FF6B6B", "#00B894", "#A29BFE", "#FD79A8", "#74B9FF"];

const CHAT_ROOMS: ChatRoom[] = [
  {
    game: "Elden Ring",
    title: "Nightreign co-op builds",
    viewers: 1243,
    messages: [
      { user: "TarnishedKing", text: "bleed builds still meta?", color: COLORS[0] },
      { user: "MaleniaSimp", text: "frost + bleed is insane rn", color: COLORS[1] },
      { user: "LetMeSoloYou", text: "nah pure str with greatshield", color: COLORS[2] },
      { user: "RatQueen", text: "anyone tried the new ash of war?", color: COLORS[3] },
      { user: "PoiseBoi", text: "the comet one? it's broken lmao", color: COLORS[4] },
      { user: "TarnishedKing", text: "wait which comet", color: COLORS[0] },
      { user: "SunbroForever", text: "the one from the night boss", color: COLORS[5] },
      { user: "MaleniaSimp", text: "yeah it staggers everything", color: COLORS[1] },
      { user: "CasualHollow", text: "I just want fashion souls tbh", color: COLORS[6] },
      { user: "RatQueen", text: "the new armor set looks sick", color: COLORS[3] },
    ],
  },
  {
    game: "GTA VI",
    title: "Release date speculation",
    viewers: 3891,
    messages: [
      { user: "ViceCity2026", text: "fall 2026 confirmed right?", color: COLORS[1] },
      { user: "TrevorPhillips", text: "Rockstar always delays lol", color: COLORS[3] },
      { user: "NeonNights", text: "the map leak was HUGE", color: COLORS[0] },
      { user: "OnlineGrinder", text: "I just want a good online launch", color: COLORS[4] },
      { user: "ViceCity2026", text: "they said spring now actually", color: COLORS[1] },
      { user: "StoryModeOnly", text: "single player is all I care about", color: COLORS[5] },
      { user: "TrevorPhillips", text: "the dual protagonist thing is hype", color: COLORS[3] },
      { user: "CarGuy99", text: "please have good car customization", color: COLORS[7] },
      { user: "NeonNights", text: "the weather system looks next gen", color: COLORS[0] },
      { user: "OnlineGrinder", text: "heists day 1 or riot", color: COLORS[4] },
    ],
  },
  {
    game: "Zelda: TotK",
    title: "Craziest Ultrahand builds",
    viewers: 876,
    messages: [
      { user: "LinkMain", text: "just made a flying tank lol", color: COLORS[2] },
      { user: "KorokHunter", text: "has anyone found all 900 yet??", color: COLORS[0] },
      { user: "ZeldaLore", text: "the depths are terrifying", color: COLORS[5] },
      { user: "LinkMain", text: "rocket shield + bomb is so fun", color: COLORS[2] },
      { user: "BuildMaster", text: "I made a working car with steering", color: COLORS[1] },
      { user: "CasualPlayer", text: "wait you can STEER?", color: COLORS[6] },
      { user: "BuildMaster", text: "yeah fans + steering stick", color: COLORS[1] },
      { user: "KorokHunter", text: "I just throw them off cliffs", color: COLORS[0] },
      { user: "ZeldaLore", text: "the zonai lore is so deep", color: COLORS[5] },
      { user: "SpeedRunner", text: "new skip found in fire temple btw", color: COLORS[3] },
    ],
  },
  {
    game: "Baldur's Gate 3",
    title: "Honor mode strategies",
    viewers: 1567,
    messages: [
      { user: "DnDForever", text: "just lost my honor run to Orin", color: COLORS[3] },
      { user: "TacticsNerd", text: "you need to burst her phase 2", color: COLORS[0] },
      { user: "BardicInsp", text: "bard + fighter multiclass is OP", color: COLORS[2] },
      { user: "SorLockKing", text: "sorlock still the best build", color: COLORS[4] },
      { user: "DnDForever", text: "what about the new patch stuff?", color: COLORS[3] },
      { user: "TacticsNerd", text: "photo mode is sick but focus on honor", color: COLORS[0] },
      { user: "KarlachFan", text: "Karlach + tavern brawler = easy mode", color: COLORS[1] },
      { user: "BardicInsp", text: "throw build is so satisfying", color: COLORS[2] },
      { user: "SorLockKing", text: "nah eldritch blast go brrrr", color: COLORS[4] },
      { user: "RolePlayer1", text: "you guys are missing the story smh", color: COLORS[5] },
    ],
  },
  {
    game: "Minecraft",
    title: "1.22 update reactions",
    viewers: 2104,
    messages: [
      { user: "BlockHead", text: "the new biome is gorgeous", color: COLORS[0] },
      { user: "RedstoneWiz", text: "new redstone components finally!", color: COLORS[2] },
      { user: "BuilderPro", text: "copper bulb changes are perfect", color: COLORS[4] },
      { user: "CreeperFear", text: "the new mob is terrifying", color: COLORS[3] },
      { user: "BlockHead", text: "wait there's a new mob?", color: COLORS[0] },
      { user: "SurvivalOnly", text: "yes it spawns in the deep dark", color: COLORS[1] },
      { user: "RedstoneWiz", text: "the auto crafter is a game changer", color: COLORS[2] },
      { user: "BuilderPro", text: "new wood type looks amazing for builds", color: COLORS[4] },
      { user: "PVPLegend", text: "any combat changes?", color: COLORS[6] },
      { user: "CreeperFear", text: "shield got buffed slightly", color: COLORS[3] },
    ],
  },
];

function LiveChat({ room }: { room: ChatRoom }) {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [index, setIndex] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start with first 3 messages
    setVisibleMessages(room.messages.slice(0, 3));
    setIndex(3);
  }, [room.messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = prev % room.messages.length;
        setVisibleMessages((msgs) => {
          const updated = [...msgs, room.messages[next]];
          // Keep last 6 visible
          return updated.slice(-6);
        });
        return prev + 1;
      });
    }, 2000 + Math.random() * 1500); // Stagger timing per card

    return () => clearInterval(interval);
  }, [room.messages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <div className="flex-shrink-0 w-[260px] card-glass overflow-hidden hover:border-primary/30 transition group">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/50 bg-surface-elevated/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">{room.game}</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            <span className="text-[10px] text-text-muted">{room.viewers.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{room.title}</p>
      </div>

      {/* Chat messages */}
      <div
        ref={chatRef}
        className="h-[140px] overflow-hidden px-3 py-2 space-y-1.5"
      >
        {visibleMessages.map((msg, i) => (
          <div key={`${msg.user}-${i}`} className="animate-fade-in">
            <span className="text-[11px]">
              <span className="font-semibold" style={{ color: msg.color }}>{msg.user}</span>
              <span className="text-text-secondary ml-1">{msg.text}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrendingChats() {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <h3 className="text-xl font-bold">Trending Chats</h3>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/10">
          <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
          <span className="text-[10px] font-semibold text-error uppercase">Live</span>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {CHAT_ROOMS.map((room) => (
          <LiveChat key={room.title} room={room} />
        ))}
      </div>
    </div>
  );
}
