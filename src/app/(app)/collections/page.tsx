"use client";

import { useState } from "react";

interface CollectionItem {
  title: string;
  image: string;
  price: string | null;
  store: string;
  tag?: string;
}

interface Board {
  id: string;
  title: string;
  description: string;
  curator: string;
  emoji: string;
  color: string;
  items: CollectionItem[];
}

const C = (id: string) => `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.jpg`;
const T = (id: string) => `https://image.tmdb.org/t/p/w500${id}`;

const BOARDS: Board[] = [
  {
    id: "elden-ring-fan",
    title: "Elden Ring Fan Collection",
    description: "The best merch, statues, and art for Tarnished completionists",
    curator: "FanCompanion Team",
    emoji: "⚔️",
    color: "from-yellow-500/20 to-orange-600/10",
    items: [
      { title: "Tarnished Premium Statue — 14\" Polystone", image: C("co4jni"), price: "$349.99", store: "Bandai Namco Store", tag: "Limited Edition" },
      { title: "Malenia Blade of Miquella Figure", image: C("co5s5v"), price: "$189.99", store: "Bandai Namco Store", tag: "Best Seller" },
      { title: "Lands Between Map Poster — Cloth Edition", image: C("co1tmu"), price: "$29.99", store: "Fangamer" },
      { title: "Golden Order Sigil LED Desk Lamp", image: C("co2q9f"), price: "$69.99", store: "Etsy" },
      { title: "Elden Ring Official Art Book Vol. 1", image: C("co4jni"), price: "$44.99", store: "Amazon" },
      { title: "Ranni the Witch Nendoroid", image: C("co670h"), price: "$54.99", store: "Good Smile Company", tag: "Pre-Order" },
    ],
  },
  {
    id: "gaming-setup",
    title: "Ultimate Gaming Setup",
    description: "Editor-picked gear for the perfect desk — headsets, controllers, and more",
    curator: "FanCompanion Team",
    emoji: "🎧",
    color: "from-primary/20 to-accent/10",
    items: [
      { title: "SteelSeries Arctis Nova Pro Wireless", image: C("co5w0w"), price: "$349.99", store: "SteelSeries", tag: "Editor's Pick" },
      { title: "PlayStation DualSense Edge Controller", image: C("co5s5v"), price: "$199.99", store: "PlayStation Direct", tag: "Top Rated" },
      { title: "Razer Huntsman V3 Pro TKL Keyboard", image: C("co5vst"), price: "$249.99", store: "Razer" },
      { title: "LG 27GR95QE OLED Gaming Monitor 27\"", image: C("co2lbd"), price: "$799.99", store: "Best Buy" },
      { title: "Secretlab Titan Evo Gaming Chair", image: C("co1tmu"), price: "$519.00", store: "Secretlab" },
    ],
  },
  {
    id: "tv-merch",
    title: "TV Show Merch We Love",
    description: "Hoodies, mugs, posters, and collectibles from the biggest shows",
    curator: "FanCompanion Team",
    emoji: "📺",
    color: "from-accent/20 to-success/10",
    items: [
      { title: "House of the Dragon Targaryen Sigil Hoodie", image: T("/z2yahl2uefxDCl0nogcRBstwruJ.jpg"), price: "$64.99", store: "HBO Shop" },
      { title: "Severance Lumon Industries Employee Kit", image: T("/lnv4wFMvcWnEXRViMUBigGMiSM6.jpg"), price: "$49.99", store: "Apple TV+ Shop", tag: "Fan Favorite" },
      { title: "Stranger Things Hellfire Club Varsity Jacket", image: T("/49WJfeN0moxb9IPfGn8AIqMGskD.jpg"), price: "$129.99", store: "Netflix Shop", tag: "Trending" },
      { title: "The Boys Homelander Action Figure", image: T("/stTEycfG9Lksg3JlOxnbhv0MBfX.jpg"), price: "$39.99", store: "Amazon" },
      { title: "Arcane Jinx Premium Art Print", image: T("/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg"), price: "$34.99", store: "Riot Games Merch" },
      { title: "The Last of Us Firefly Pendant Necklace", image: T("/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg"), price: "$24.99", store: "Naughty Dog Store" },
    ],
  },
  {
    id: "collectors-editions",
    title: "Collector's Editions Worth It",
    description: "Premium game editions that are actually worth the price tag",
    curator: "FanCompanion Team",
    emoji: "💎",
    color: "from-error/20 to-pink-500/10",
    items: [
      { title: "Baldur's Gate 3 Collector's Edition", image: C("co670h"), price: "$269.99", store: "Larian Studios", tag: "Sold Out" },
      { title: "Zelda: Tears of the Kingdom CE w/ Artbook", image: C("co5vmg"), price: "$129.99", store: "Nintendo Store" },
      { title: "Cyberpunk 2077 Ultimate Edition Steelbook", image: C("co5w0w"), price: "$79.99", store: "CD Projekt Red Gear" },
      { title: "God of War Ragnarök Jötnar Edition", image: C("co5s5v"), price: "$259.99", store: "PlayStation Direct", tag: "Limited Edition" },
      { title: "Starfield Constellation Edition", image: C("co5vst"), price: "$299.99", store: "Bethesda Store" },
    ],
  },
  {
    id: "fan-art-gallery",
    title: "Fan Art & Fine Prints",
    description: "Museum-quality prints and original art from the gaming world",
    curator: "FanCompanion Team",
    emoji: "🎨",
    color: "from-pink-500/20 to-primary/10",
    items: [
      { title: "Hades — Zagreus & Cerberus Giclee Print", image: C("co2q9f"), price: "$29.99", store: "Supergiant Games" },
      { title: "Skyrim Dragon Encounter Fine Art Print", image: C("co1tnw"), price: "$79.99", store: "Cook & Becker", tag: "Limited Edition" },
      { title: "The Witcher — Geralt of Rivia Portrait", image: C("co1wyy"), price: "$49.99", store: "Dark Horse" },
      { title: "Genshin Impact — Mondstadt Panorama Canvas", image: C("co2mjs"), price: "$89.99", store: "miHoYo Store" },
    ],
  },
  {
    id: "zelda-treasures",
    title: "Zelda Treasures",
    description: "Everything for the Hyrule completionist — from figures to fashion",
    curator: "FanCompanion Team",
    emoji: "🗡️",
    color: "from-success/20 to-accent/10",
    items: [
      { title: "Master Sword & Hylian Shield Replica Set", image: C("co5vmg"), price: "$149.99", store: "Amazon", tag: "Best Seller" },
      { title: "Link Nendoroid — Tears of the Kingdom Ver.", image: C("co3p2d"), price: "$54.99", store: "Good Smile Company" },
      { title: "Hylian Crest Embroidered Bomber Jacket", image: C("co5vmg"), price: "$89.99", store: "Nintendo Store" },
      { title: "Korok Plush Collection (Set of 5)", image: C("co3p2d"), price: "$44.99", store: "Fangamer", tag: "Fan Favorite" },
      { title: "Breath of the Wild Deluxe Art Book", image: C("co3p2d"), price: "$39.99", store: "Dark Horse Comics" },
    ],
  },
  {
    id: "cozy-gaming",
    title: "Cozy Gaming Vibes",
    description: "Plushies, blankets, candles, and everything for chill gaming sessions",
    curator: "FanCompanion Team",
    emoji: "🧸",
    color: "from-xp/20 to-yellow-500/10",
    items: [
      { title: "Stardew Valley Junimo Plush Set", image: C("xrpmydnu9rpxvxfjkiu7"), price: "$34.99", store: "Fangamer", tag: "Fan Favorite" },
      { title: "Minecraft Creeper Weighted Blanket", image: C("co49x5"), price: "$59.99", store: "Minecraft Shop" },
      { title: "Animal Crossing Isabelle XL Plush", image: C("co3wls"), price: "$29.99", store: "Nintendo Store" },
      { title: "Pokémon Snorlax Bean Bag Chair", image: C("co2mjs"), price: "$149.99", store: "Pokémon Center", tag: "Trending" },
      { title: "Fireplace Tavern Soy Candle — RPG Scent", image: C("co1xa4"), price: "$18.99", store: "Etsy" },
    ],
  },
  {
    id: "gaming-bookshelf",
    title: "The Gaming Bookshelf",
    description: "Art books, lore compendiums, strategy guides, and tie-in novels",
    curator: "FanCompanion Team",
    emoji: "📚",
    color: "from-blue-500/20 to-primary/10",
    items: [
      { title: "The Witcher: Illustrated Treasury Hardcover", image: C("co1wyy"), price: "$49.99", store: "Dark Horse Comics" },
      { title: "Horizon Zero Dawn — Collector's Art Book", image: C("co1rc7"), price: "$39.99", store: "Titan Books" },
      { title: "The Boys: Homelander Comic Omnibus", image: T("/stTEycfG9Lksg3JlOxnbhv0MBfX.jpg"), price: "$59.99", store: "Dynamite Comics" },
      { title: "Dark Souls — Design Works Hardcover", image: C("co4jni"), price: "$34.99", store: "Udon Entertainment" },
    ],
  },
];

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23161B22' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%23484F58' text-anchor='middle' dy='.3em' font-size='48'%3E%F0%9F%8E%AE%3C/text%3E%3C/svg%3E";

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.target as HTMLImageElement).src = FALLBACK_IMG;
}

function tagColor(tag: string) {
  switch (tag) {
    case "Limited Edition": return "bg-error/90 text-white";
    case "Best Seller": return "bg-success/90 text-black";
    case "Sold Out": return "bg-text-muted text-background";
    case "Pre-Order": return "bg-accent/90 text-black";
    case "Trending": return "bg-primary/90 text-white";
    case "Fan Favorite": return "bg-xp/90 text-black";
    case "Editor's Pick": return "bg-pink-500/90 text-white";
    case "Top Rated": return "bg-yellow-500/90 text-black";
    default: return "bg-surface-elevated text-text-secondary";
  }
}

export default function CollectionsPage() {
  const [openBoard, setOpenBoard] = useState<Board | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  function toggleSave(key: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (openBoard) {
    return (
      <div>
        {/* Board detail header */}
        <button
          onClick={() => setOpenBoard(null)}
          className="flex items-center gap-2 text-primary hover:text-primary-light transition mb-5"
        >
          <span>←</span>
          <span className="text-sm font-medium">All Collections</span>
        </button>

        <div className={`relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br ${openBoard.color} p-6 sm:p-8 mb-6`}>
          <div className="relative">
            <span className="text-4xl">{openBoard.emoji}</span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">{openBoard.title}</h1>
            <p className="text-text-secondary mt-1">{openBoard.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-text-muted">by {openBoard.curator}</span>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-muted">{openBoard.items.length} items</span>
            </div>
          </div>
        </div>

        {/* Items masonry */}
        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {openBoard.items.map((item, i) => {
            const key = `${openBoard.id}-${i}`;
            const isTall = i % 3 === 0;
            return (
              <div
                key={key}
                className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-border/50 bg-surface hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
              >
                <div className={`relative overflow-hidden ${isTall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={handleImgError}
                  />
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                    {item.tag && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagColor(item.tag)}`}>
                        {item.tag}
                      </span>
                    )}
                    <button
                      onClick={() => toggleSave(key)}
                      className={`ml-auto w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                        saved.has(key)
                          ? "bg-error/90 text-white"
                          : "bg-black/40 text-white/70 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {saved.has(key) ? "♥" : "♡"}
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-text-muted">{item.store}</p>
                    {item.price && (
                      <span className="text-sm font-bold text-foreground">{item.price}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Collections</h1>
        <p className="text-text-secondary mt-1">Curated boards of merch, figures, art, gear & more — picked by fans, for fans</p>
      </div>

      {/* Board grid — Pinterest style */}
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {BOARDS.map((board) => (
          <button
            key={board.id}
            onClick={() => setOpenBoard(board)}
            className="break-inside-avoid w-full text-left group"
          >
            <div className="rounded-2xl overflow-hidden border border-border/50 bg-surface hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
              {/* 2x2 collage cover */}
              <div className="grid grid-cols-2 gap-0.5 p-0.5">
                <div className="aspect-square overflow-hidden rounded-tl-xl">
                  <img src={board.items[0]?.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={handleImgError} />
                </div>
                <div className="aspect-square overflow-hidden rounded-tr-xl">
                  <img src={board.items[1]?.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={handleImgError} />
                </div>
                {board.items.length > 2 && (
                  <div className="aspect-square overflow-hidden rounded-bl-xl">
                    <img src={board.items[2]?.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={handleImgError} />
                  </div>
                )}
                {board.items.length > 3 ? (
                  <div className="aspect-square overflow-hidden rounded-br-xl relative">
                    <img src={board.items[3]?.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={handleImgError} />
                    {board.items.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">+{board.items.length - 3}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square overflow-hidden rounded-br-xl bg-surface-elevated flex items-center justify-center text-2xl">
                    {board.emoji}
                  </div>
                )}
              </div>

              {/* Board info */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{board.emoji}</span>
                  <h3 className="font-bold text-sm group-hover:text-primary transition line-clamp-1">{board.title}</h3>
                </div>
                <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">{board.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-text-muted">{board.items.length} items</span>
                  <span className="text-[10px] text-text-muted">·</span>
                  <span className="text-[10px] text-text-muted">{board.curator}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
