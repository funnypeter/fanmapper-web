"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ChatMessage {
  user: string;
  text: string;
  color: string;
}

interface ChatRoom {
  show: string;
  title: string;
  viewers: number;
  messages: ChatMessage[];
}

const COLORS = ["#6C5CE7", "#00CEC9", "#FDCB6E", "#FF6B6B", "#00B894", "#A29BFE", "#FD79A8", "#74B9FF"];

const TV_CHAT_ROOMS: ChatRoom[] = [
  {
    show: "House of the Dragon",
    title: "Season 3 fan theories",
    viewers: 4521,
    messages: [
      { user: "DragonRider", text: "Daemon's vision was foreshadowing everything", color: COLORS[0] },
      { user: "TeamBlack", text: "Rhaenyra is the rightful queen period", color: COLORS[1] },
      { user: "TeamGreen", text: "Aemond is the most compelling character", color: COLORS[3] },
      { user: "BookReader", text: "the show is diverging from Fire & Blood a lot", color: COLORS[2] },
      { user: "DragonRider", text: "that dragon battle was INSANE", color: COLORS[0] },
      { user: "CasualFan", text: "I can't keep track of all the Targaryens lol", color: COLORS[6] },
      { user: "TeamBlack", text: "the soundtrack is carrying this season", color: COLORS[1] },
      { user: "BookReader", text: "wait until you see what happens next", color: COLORS[2] },
    ],
  },
  {
    show: "Severance",
    title: "The outie floor theories",
    viewers: 2187,
    messages: [
      { user: "InnieLife", text: "what if the whole town is severed?", color: COLORS[0] },
      { user: "LumonSlave", text: "the goat room still haunts me", color: COLORS[3] },
      { user: "MarkScout", text: "that season 2 finale was a masterpiece", color: COLORS[1] },
      { user: "WaffleParty", text: "I want a waffle party IRL", color: COLORS[2] },
      { user: "InnieLife", text: "Helly R's reveal was the best twist on TV", color: COLORS[0] },
      { user: "LumonSlave", text: "the music design in this show is next level", color: COLORS[3] },
      { user: "MarkScout", text: "every episode feels like a short film", color: COLORS[1] },
      { user: "MDRFan", text: "the macrodata refinement scenes are oddly relaxing", color: COLORS[4] },
    ],
  },
  {
    show: "The Last of Us",
    title: "Game vs show differences",
    viewers: 3344,
    messages: [
      { user: "GameFirst", text: "episode 3 was better than anything in the game", color: COLORS[0] },
      { user: "JoelFan", text: "Pedro Pascal IS Joel", color: COLORS[1] },
      { user: "EllieFan", text: "Bella Ramsey nailed it from episode 1", color: COLORS[2] },
      { user: "GameFirst", text: "the infected designs are even scarier on screen", color: COLORS[0] },
      { user: "Skeptic", text: "some changes from the game feel unnecessary", color: COLORS[3] },
      { user: "JoelFan", text: "the cinematography is movie quality", color: COLORS[1] },
      { user: "EllieFan", text: "season 2 is going to destroy us emotionally", color: COLORS[2] },
      { user: "NewViewer", text: "never played the game, show is incredible", color: COLORS[5] },
    ],
  },
  {
    show: "Squid Game",
    title: "Season 3 predictions",
    viewers: 5102,
    messages: [
      { user: "Player456", text: "Gi-hun is definitely going back in", color: COLORS[0] },
      { user: "FrontMan", text: "the Front Man backstory needs more", color: COLORS[3] },
      { user: "RedLight", text: "what new games do you think they'll have?", color: COLORS[1] },
      { user: "Player456", text: "I think the old man has a successor", color: COLORS[0] },
      { user: "KDramaFan", text: "the social commentary is what makes it great", color: COLORS[4] },
      { user: "FrontMan", text: "season 2 was a good setup for the finale", color: COLORS[3] },
      { user: "RedLight", text: "the doll scene will never not be iconic", color: COLORS[1] },
      { user: "NewWatcher", text: "just binged both seasons in two days", color: COLORS[5] },
    ],
  },
  {
    show: "Stranger Things",
    title: "Final season hype",
    viewers: 6230,
    messages: [
      { user: "ElevenFan", text: "the final season better give Eleven a good ending", color: COLORS[0] },
      { user: "UpsideDown", text: "Vecna is the best villain in the show", color: COLORS[3] },
      { user: "80sVibes", text: "the soundtrack carries so hard", color: COLORS[1] },
      { user: "DustinRules", text: "if anything happens to Dustin I'm done", color: COLORS[2] },
      { user: "ElevenFan", text: "Running Up That Hill still gives chills", color: COLORS[0] },
      { user: "UpsideDown", text: "they said each episode is movie length", color: COLORS[3] },
      { user: "80sVibes", text: "the time jump is going to be interesting", color: COLORS[1] },
      { user: "SteveMom", text: "Steve Harrington is the real MVP of this show", color: COLORS[6] },
    ],
  },
];

function useTVAnimatedChat(messages: ChatMessage[], maxVisible: number) {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [index, setIndex] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleMessages(messages.slice(0, Math.min(3, maxVisible)));
    setIndex(3);
  }, [messages, maxVisible]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = prev % messages.length;
        setVisibleMessages((msgs) => [...msgs, messages[next]].slice(-maxVisible));
        return prev + 1;
      });
    }, 2000 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [messages, maxVisible]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [visibleMessages]);

  return { visibleMessages, chatRef };
}

function TVLiveChat({ room, onSelect }: { room: ChatRoom; onSelect: (room: ChatRoom) => void }) {
  const { visibleMessages, chatRef } = useTVAnimatedChat(room.messages, 6);

  return (
    <button
      onClick={() => onSelect(room)}
      className="flex-shrink-0 w-[260px] card-glass overflow-hidden hover:border-primary/30 transition group text-left cursor-pointer"
    >
      <div className="px-3 py-2.5 border-b border-border/50 bg-surface-elevated/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">{room.show}</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            <span className="text-[10px] text-text-muted">{room.viewers.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{room.title}</p>
      </div>
      <div ref={chatRef} className="h-[140px] overflow-hidden px-3 py-2 space-y-1.5">
        {visibleMessages.map((msg, i) => (
          <div key={`${msg.user}-${i}`} className="animate-fade-in">
            <span className="text-[11px]">
              <span className="font-semibold" style={{ color: msg.color }}>{msg.user}</span>
              <span className="text-text-secondary ml-1">{msg.text}</span>
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}

function TVChatModal({ room, onClose }: { room: ChatRoom; onClose: () => void }) {
  const { visibleMessages } = useTVAnimatedChat(room.messages, 20);
  const [inputValue, setInputValue] = useState("");
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);
  const allMessages = [...visibleMessages, ...userMessages];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [allMessages.length]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    setUserMessages((prev) => [...prev, { user: "You", text: inputValue.trim(), color: "#A29BFE" }]);
    setInputValue("");
  }, [inputValue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg h-[80vh] max-h-[600px] rounded-2xl overflow-hidden border border-border bg-surface flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-border bg-surface-elevated flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">{room.show}</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-error/10">
                <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                <span className="text-[10px] font-semibold text-error uppercase">Live</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-0.5">{room.title}</h3>
            <p className="text-xs text-text-muted">{room.viewers.toLocaleString()} watching</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-foreground transition text-2xl leading-none p-1">&times;</button>
        </div>
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
        <div className="px-4 py-3 border-t border-border bg-surface-elevated flex-shrink-0">
          <div className="flex gap-2">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Send a message..."
              className="flex-1 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition" />
            <button onClick={handleSend} disabled={!inputValue.trim()} className="btn-primary px-4 py-2.5 rounded-xl text-sm">Chat</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TVTrendingChats({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);

  return (
    <div className={hideHeader ? "" : "mb-10"}>
      {!hideHeader && (
        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-xl font-bold">Trending Chats</h3>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/10">
            <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            <span className="text-[10px] font-semibold text-error uppercase">Live</span>
          </div>
        </div>
      )}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {TV_CHAT_ROOMS.map((room) => (
          <TVLiveChat key={room.title} room={room} onSelect={setSelectedRoom} />
        ))}
      </div>
      {selectedRoom && <TVChatModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />}
    </div>
  );
}
