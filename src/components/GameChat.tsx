"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ChatMessage {
  user: string;
  text: string;
  color: string;
}

const COLORS = ["#6C5CE7", "#00CEC9", "#FDCB6E", "#FF6B6B", "#00B894", "#A29BFE", "#FD79A8", "#74B9FF"];

const GAME_CHATS: Record<string, { title: string; viewers: number; messages: ChatMessage[] }> = {
  "Elden Ring": {
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
    ],
  },
  "The Elder Scrolls V: Skyrim": {
    title: "Best modded playthroughs",
    viewers: 892,
    messages: [
      { user: "DragonSlyr", text: "requiem mod changes everything", color: COLORS[0] },
      { user: "SweetrollThief", text: "anyone else do a no fast travel run?", color: COLORS[1] },
      { user: "ArchMage99", text: "pure mage is underrated", color: COLORS[2] },
      { user: "NordicWarrior", text: "stealth archer always wins tho", color: COLORS[3] },
      { user: "DragonSlyr", text: "lol every build becomes stealth archer", color: COLORS[0] },
      { user: "ModLord", text: "try Beyond Skyrim, it's incredible", color: COLORS[4] },
      { user: "SweetrollThief", text: "the civil war expanded mod is great", color: COLORS[1] },
      { user: "ArchMage99", text: "Apocalypse spells + ordinator = chef's kiss", color: COLORS[2] },
    ],
  },
  "Fallout 4": {
    title: "Settlement building tips",
    viewers: 654,
    messages: [
      { user: "Minuteman01", text: "another settlement needs your help", color: COLORS[0] },
      { user: "VaultDweller", text: "please no more Preston quests", color: COLORS[3] },
      { user: "WastelandArch", text: "the new sim settlements mod is crazy", color: COLORS[1] },
      { user: "NukaFan", text: "has anyone maxed out Sanctuary?", color: COLORS[2] },
      { user: "Minuteman01", text: "I have 30 settlers there now lol", color: COLORS[0] },
      { user: "PowerArmor", text: "defense turrets are OP if you stack them", color: COLORS[4] },
      { user: "WastelandArch", text: "try the warehouse prefabs, saves time", color: COLORS[1] },
      { user: "VaultDweller", text: "supply lines between all settlements changed my life", color: COLORS[3] },
    ],
  },
  "Genshin Impact": {
    title: "Team comp theorycrafting",
    viewers: 2341,
    messages: [
      { user: "PrimoSaver", text: "is the new banner worth pulling?", color: COLORS[0] },
      { user: "AbyssCleared", text: "yes if you need a pyro DPS", color: COLORS[1] },
      { user: "F2PBtw", text: "saving everything for Fontaine characters", color: COLORS[2] },
      { user: "WhaleLord", text: "C6 changes everything tbh", color: COLORS[3] },
      { user: "PrimoSaver", text: "must be nice to be a whale lol", color: COLORS[0] },
      { user: "AbyssCleared", text: "national team still clears everything F2P", color: COLORS[1] },
      { user: "TeaPotDesigner", text: "forget abyss, teapot is endgame", color: COLORS[5] },
      { user: "F2PBtw", text: "based teapot enjoyer", color: COLORS[2] },
    ],
  },
  "Zelda: Tears of the Kingdom": {
    title: "Craziest Ultrahand builds",
    viewers: 876,
    messages: [
      { user: "LinkMain", text: "just made a flying tank lol", color: COLORS[2] },
      { user: "KorokHunter", text: "has anyone found all 900 yet??", color: COLORS[0] },
      { user: "ZeldaLore", text: "the depths are terrifying", color: COLORS[5] },
      { user: "BuildMaster", text: "I made a working car with steering", color: COLORS[1] },
      { user: "CasualPlayer", text: "wait you can STEER?", color: COLORS[6] },
      { user: "BuildMaster", text: "yeah fans + steering stick", color: COLORS[1] },
      { user: "KorokHunter", text: "I just throw them off cliffs", color: COLORS[0] },
      { user: "SpeedRunner", text: "new skip found in fire temple btw", color: COLORS[3] },
    ],
  },
  "The Witcher 3: Wild Hunt": {
    title: "Which ending did you get?",
    viewers: 723,
    messages: [
      { user: "GeraltFan", text: "Ciri as Witcher is the only ending", color: COLORS[0] },
      { user: "TeamTriss", text: "Triss > Yen don't @ me", color: COLORS[3] },
      { user: "TeamYen", text: "literally wrong but ok", color: COLORS[1] },
      { user: "GwentAddict", text: "I'm just here for Gwent honestly", color: COLORS[2] },
      { user: "GeraltFan", text: "Blood and Wine is the best DLC ever made", color: COLORS[0] },
      { user: "LoreNerd", text: "the books make the ending hit different", color: COLORS[4] },
      { user: "TeamTriss", text: "Hearts of Stone villain was terrifying", color: COLORS[3] },
      { user: "GwentAddict", text: "they should make a standalone Gwent RPG", color: COLORS[2] },
    ],
  },
  "Grand Theft Auto V": {
    title: "GTA VI hype and memories",
    viewers: 3102,
    messages: [
      { user: "LosSantos", text: "GTA V is still goated after all these years", color: COLORS[0] },
      { user: "OnlineChaos", text: "the Cayo Perico heist is easy money", color: COLORS[1] },
      { user: "TrevorFan", text: "Trevor's missions were unhinged lol", color: COLORS[3] },
      { user: "RacerX", text: "stunt races in online are peak", color: COLORS[4] },
      { user: "LosSantos", text: "can't wait for VI though", color: COLORS[0] },
      { user: "OnlineChaos", text: "hope they fix the griefer jets", color: COLORS[1] },
      { user: "StoryMode", text: "wish they made story DLC instead of online updates", color: COLORS[5] },
      { user: "TrevorFan", text: "Franklin's ending is canon, fight me", color: COLORS[3] },
    ],
  },
  "God of War": {
    title: "Ragnarok vs 2018 debate",
    viewers: 567,
    messages: [
      { user: "BoyFather", text: "2018 had the better story surprise", color: COLORS[0] },
      { user: "NorseMyth", text: "Ragnarok combat is way better though", color: COLORS[1] },
      { user: "AxeThrow", text: "first time getting the axe back... chills", color: COLORS[2] },
      { user: "BoyFather", text: "Baldur fight is still the best boss in gaming", color: COLORS[0] },
      { user: "ValkyrieSlyr", text: "Sigrun would like a word", color: COLORS[3] },
      { user: "NorseMyth", text: "the Atreus sections in Ragnarok were mid", color: COLORS[1] },
      { user: "AxeThrow", text: "spear weapon was a nice addition though", color: COLORS[2] },
      { user: "ValkyrieSlyr", text: "Gna was harder than Sigrun change my mind", color: COLORS[3] },
    ],
  },
  "Hades": {
    title: "Best weapon aspects",
    viewers: 445,
    messages: [
      { user: "ZagMain", text: "Aspect of Gilgamesh is sleeper OP", color: COLORS[0] },
      { user: "RunGod", text: "nah Eris rail clears everything", color: COLORS[1] },
      { user: "ThanFan", text: "I just play for the romance options tbh", color: COLORS[6] },
      { user: "ZagMain", text: "Chiron bow with Aphrodite is broken", color: COLORS[0] },
      { user: "SpeedRunner", text: "sub 10 min runs with rail are possible", color: COLORS[3] },
      { user: "RunGod", text: "Dionysus + Ares duo boon is insane", color: COLORS[1] },
      { user: "ThanFan", text: "Hades 2 early access is incredible btw", color: COLORS[6] },
      { user: "SpeedRunner", text: "the new sprint mechanic changes everything", color: COLORS[3] },
    ],
  },
  "Stardew Valley": {
    title: "Farm layout showcase",
    viewers: 1089,
    messages: [
      { user: "FarmLife", text: "just hit year 5 with full automation", color: COLORS[0] },
      { user: "JunimoFan", text: "ancient fruit wine is the meta", color: COLORS[4] },
      { user: "FishingPro", text: "legend fish took me 3 seasons to catch", color: COLORS[1] },
      { user: "FarmLife", text: "the 1.6 update added so much", color: COLORS[0] },
      { user: "CaveExplorer", text: "skull cavern floor 100+ is terrifying", color: COLORS[3] },
      { user: "JunimoFan", text: "junimo huts are the best thing ever", color: COLORS[4] },
      { user: "MarriageGoals", text: "Krobus roommate is underrated", color: COLORS[5] },
      { user: "FishingPro", text: "multiplayer farm with friends is peak", color: COLORS[1] },
    ],
  },
  "Baldur's Gate III": {
    title: "Honor mode strategies",
    viewers: 1567,
    messages: [
      { user: "DnDForever", text: "just lost my honor run to Orin", color: COLORS[3] },
      { user: "TacticsNerd", text: "you need to burst her phase 2", color: COLORS[0] },
      { user: "BardicInsp", text: "bard + fighter multiclass is OP", color: COLORS[2] },
      { user: "SorLockKing", text: "sorlock still the best build", color: COLORS[4] },
      { user: "KarlachFan", text: "Karlach + tavern brawler = easy mode", color: COLORS[1] },
      { user: "BardicInsp", text: "throw build is so satisfying", color: COLORS[2] },
      { user: "SorLockKing", text: "nah eldritch blast go brrrr", color: COLORS[4] },
      { user: "RolePlayer1", text: "you guys are missing the story smh", color: COLORS[5] },
    ],
  },
  "Cyberpunk 2077": {
    title: "Phantom Liberty builds",
    viewers: 934,
    messages: [
      { user: "NightCity", text: "netrunner is still the most fun", color: COLORS[0] },
      { user: "EdgeRunner", text: "monowire + sandevistan is insane", color: COLORS[1] },
      { user: "CorpoRat", text: "Phantom Liberty story was chef's kiss", color: COLORS[2] },
      { user: "NightCity", text: "the new skill tree rework changed everything", color: COLORS[0] },
      { user: "Samurai2077", text: "gorilla arms boxing questline tho", color: COLORS[3] },
      { user: "EdgeRunner", text: "vehicle combat actually works now", color: COLORS[1] },
      { user: "CorpoRat", text: "Songbird ending destroyed me", color: COLORS[2] },
      { user: "Samurai2077", text: "Panam best romance no debate", color: COLORS[3] },
    ],
  },
  "Minecraft": {
    title: "1.22 update reactions",
    viewers: 2104,
    messages: [
      { user: "BlockHead", text: "the new biome is gorgeous", color: COLORS[0] },
      { user: "RedstoneWiz", text: "new redstone components finally!", color: COLORS[2] },
      { user: "BuilderPro", text: "copper bulb changes are perfect", color: COLORS[4] },
      { user: "CreeperFear", text: "the new mob is terrifying", color: COLORS[3] },
      { user: "SurvivalOnly", text: "yes it spawns in the deep dark", color: COLORS[1] },
      { user: "RedstoneWiz", text: "the auto crafter is a game changer", color: COLORS[2] },
      { user: "BuilderPro", text: "new wood type looks amazing for builds", color: COLORS[4] },
      { user: "CreeperFear", text: "shield got buffed slightly", color: COLORS[3] },
    ],
  },
  "Starfield": {
    title: "Shattered Space impressions",
    viewers: 412,
    messages: [
      { user: "SpaceExplorer", text: "shattered space is way better than base game", color: COLORS[0] },
      { user: "BethesdaFan", text: "hand-crafted content is what we needed", color: COLORS[1] },
      { user: "ShipBuilder", text: "the new ship parts are amazing", color: COLORS[2] },
      { user: "SpaceExplorer", text: "Va'ruun lore is actually interesting", color: COLORS[0] },
      { user: "Skeptic", text: "still no ground vehicles though...", color: COLORS[3] },
      { user: "BethesdaFan", text: "mods fix a lot of the issues tbh", color: COLORS[1] },
      { user: "ShipBuilder", text: "I spent 40 hours just building ships", color: COLORS[2] },
      { user: "Skeptic", text: "the outpost system needs work", color: COLORS[3] },
    ],
  },
  "Outer Wilds": {
    title: "First playthrough reactions",
    viewers: 334,
    messages: [
      { user: "CuriousAstro", text: "NO SPOILERS but the ending...", color: COLORS[0] },
      { user: "TimeLooper", text: "the moment it all clicks is magical", color: COLORS[1] },
      { user: "DarkBramble", text: "dark bramble is pure anxiety", color: COLORS[3] },
      { user: "CuriousAstro", text: "I wish I could forget and replay it", color: COLORS[0] },
      { user: "EchoesOfEye", text: "the DLC is equally incredible", color: COLORS[4] },
      { user: "TimeLooper", text: "best exploration game ever made imo", color: COLORS[1] },
      { user: "DarkBramble", text: "the anglerfish still haunt me", color: COLORS[3] },
      { user: "EchoesOfEye", text: "the slide reels in the DLC are so creative", color: COLORS[4] },
    ],
  },
};

// Fallback for games not in the registry
const DEFAULT_CHAT = {
  title: "General discussion",
  viewers: 156,
  messages: [
    { user: "Gamer1", text: "anyone else playing this right now?", color: COLORS[0] },
    { user: "ProPlayer", text: "yeah it's pretty solid so far", color: COLORS[1] },
    { user: "NewHere", text: "any tips for beginners?", color: COLORS[2] },
    { user: "Gamer1", text: "take your time and explore everything", color: COLORS[0] },
    { user: "ProPlayer", text: "the combat system is deeper than it looks", color: COLORS[1] },
    { user: "Veteran", text: "second playthrough hits different", color: COLORS[3] },
    { user: "NewHere", text: "thanks! loving it so far", color: COLORS[2] },
    { user: "Veteran", text: "it only gets better trust me", color: COLORS[3] },
  ],
};

function getChatForGame(gameTitle: string) {
  return GAME_CHATS[gameTitle] ?? DEFAULT_CHAT;
}

export default function GameChat({ gameTitle }: { gameTitle: string }) {
  const chat = getChatForGame(gameTitle);
  const [expanded, setExpanded] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [index, setIndex] = useState(0);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleMessages(chat.messages.slice(0, 3));
    setIndex(3);
  }, [chat.messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = prev % chat.messages.length;
        setVisibleMessages((msgs) => {
          const updated = [...msgs, chat.messages[next]];
          return updated.slice(expanded ? -30 : -4);
        });
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [chat.messages, expanded]);

  useEffect(() => {
    if (!expanded && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages, expanded]);

  useEffect(() => {
    if (expanded) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleMessages, userMessages, expanded]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    setUserMessages((prev) => [
      ...prev,
      { user: "You", text: inputValue.trim(), color: "#A29BFE" },
    ]);
    setInputValue("");
  }, [inputValue]);

  const allMessages = [...visibleMessages, ...userMessages];

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="card-glass p-5 flex items-center gap-4 hover:border-accent/30 transition group w-full text-left cursor-pointer"
      >
        <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center text-xl shrink-0">💬</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm group-hover:text-accent transition">Live Chat</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
              <span className="text-[10px] text-text-muted">{chat.viewers}</span>
            </div>
          </div>
          <div
            ref={chatRef}
            className="overflow-hidden h-[18px] mt-1"
          >
            {visibleMessages.slice(-1).map((msg, i) => (
              <p key={`${msg.user}-${i}`} className="text-[11px] truncate animate-fade-in">
                <span className="font-semibold" style={{ color: msg.color }}>{msg.user}</span>
                <span className="text-text-muted ml-1">{msg.text}</span>
              </p>
            ))}
          </div>
        </div>
        <span className="text-accent">→</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg h-[80vh] max-h-[600px] rounded-2xl overflow-hidden border border-border bg-surface flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-surface-elevated flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">{gameTitle}</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-error/10">
                <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                <span className="text-[10px] font-semibold text-error uppercase">Live</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-0.5">{chat.title}</h3>
            <p className="text-xs text-text-muted">{chat.viewers.toLocaleString()} watching</p>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="text-text-muted hover:text-foreground transition text-2xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {allMessages.map((msg, i) => (
            <div key={`${msg.user}-${i}`} className="animate-fade-in">
              <span className="text-sm">
                <span className="font-semibold" style={{ color: msg.color }}>{msg.user}</span>
                <span className="text-text-secondary ml-1.5">{msg.text}</span>
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border bg-surface-elevated flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Send a message..."
              className="flex-1 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="btn-primary px-4 py-2.5 rounded-xl text-sm"
            >
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
