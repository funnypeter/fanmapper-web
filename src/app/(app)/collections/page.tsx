"use client";

import { useState } from "react";

interface CollectionPin {
  id: number;
  title: string;
  image: string;
  category: string;
  price: string | null;
  store: string;
  tag?: string;
  tall?: boolean;
}

const CATEGORIES = ["All", "Merch", "Figures", "Art", "Gear", "Books", "Games"];

const PINS: CollectionPin[] = [
  {
    id: 1,
    title: "Elden Ring Tarnished Premium Statue",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/scfnmj.jpg",
    category: "Figures",
    price: "$349.99",
    store: "Bandai Namco Store",
    tag: "Limited Edition",
    tall: true,
  },
  {
    id: 2,
    title: "The Last of Us Part II Vinyl Soundtrack",
    image: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    category: "Merch",
    price: "$39.99",
    store: "iam8bit",
  },
  {
    id: 3,
    title: "God of War Leviathan Axe Replica",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8vpf.jpg",
    category: "Figures",
    price: "$199.99",
    store: "PlayStation Gear",
    tag: "Best Seller",
    tall: true,
  },
  {
    id: 4,
    title: "Zelda: Tears of the Kingdom Art Book",
    image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
    category: "Books",
    price: "$44.99",
    store: "Amazon",
  },
  {
    id: 5,
    title: "Cyberpunk 2077 Night City LED Neon Sign",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8h0n.jpg",
    category: "Merch",
    price: "$89.99",
    store: "CD Projekt Red Gear",
    tall: true,
  },
  {
    id: 6,
    title: "House of the Dragon Targaryen Sigil Hoodie",
    image: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    category: "Merch",
    price: "$64.99",
    store: "HBO Shop",
  },
  {
    id: 7,
    title: "SteelSeries Arctis Nova Pro Gaming Headset",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sccndt.jpg",
    category: "Gear",
    price: "$349.99",
    store: "SteelSeries",
    tag: "Editor's Pick",
  },
  {
    id: 8,
    title: "Baldur's Gate 3 Collector's Edition",
    image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg",
    category: "Games",
    price: "$269.99",
    store: "Larian Studios",
    tag: "Sold Out",
    tall: true,
  },
  {
    id: 9,
    title: "Severance Lumon Industries Employee Mug",
    image: "https://image.tmdb.org/t/p/w500/pBp2i1JMz6PjKMn3BIEhyDsl3mU.jpg",
    category: "Merch",
    price: "$24.99",
    store: "Apple TV+ Shop",
  },
  {
    id: 10,
    title: "Stardew Valley Junimo Plush Set",
    image: "https://images.igdb.com/igdb/image/upload/t_cover_big/xrpmydnu9rpxvxfjkiu7.jpg",
    category: "Figures",
    price: "$34.99",
    store: "Fangamer",
    tag: "Fan Favorite",
  },
  {
    id: 11,
    title: "Hades Supergiant Art Print Collection",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8gp9.jpg",
    category: "Art",
    price: "$29.99",
    store: "Supergiant Games",
    tall: true,
  },
  {
    id: 12,
    title: "The Witcher: Illustrated Treasury",
    image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
    category: "Books",
    price: "$49.99",
    store: "Dark Horse Comics",
  },
  {
    id: 13,
    title: "Razer BlackShark V2 Pro - Halo Infinite Ed.",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc9ehd.jpg",
    category: "Gear",
    price: "$179.99",
    store: "Razer",
  },
  {
    id: 14,
    title: "Stranger Things Hellfire Club Varsity Jacket",
    image: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    category: "Merch",
    price: "$129.99",
    store: "Netflix Shop",
    tag: "Trending",
    tall: true,
  },
  {
    id: 15,
    title: "Minecraft Creeper Anatomy Vinyl Figure",
    image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg",
    category: "Figures",
    price: "$59.99",
    store: "Mighty Jaxx",
  },
  {
    id: 16,
    title: "Genshin Impact Zhongli Premium Figure",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc91bj.jpg",
    category: "Figures",
    price: "$249.99",
    store: "miHoYo Store",
    tag: "Pre-Order",
    tall: true,
  },
  {
    id: 17,
    title: "The Boys: Homelander Comic Omnibus",
    image: "https://image.tmdb.org/t/p/w500/stTEycfG9Lksg3JlOxnbhv0MBfX.jpg",
    category: "Books",
    price: "$59.99",
    store: "Dynamite Comics",
  },
  {
    id: 18,
    title: "Skyrim Dragon Encounter Fine Art Print",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/yllwxzz3uhjfb2a8jxjm.jpg",
    category: "Art",
    price: "$79.99",
    store: "Cook & Becker",
    tall: true,
  },
  {
    id: 19,
    title: "PlayStation DualSense Edge Controller",
    image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc9ei3.jpg",
    category: "Gear",
    price: "$199.99",
    store: "PlayStation Direct",
    tag: "Top Rated",
  },
  {
    id: 20,
    title: "Arcane Jinx Nendoroid Figure",
    image: "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    category: "Figures",
    price: "$54.99",
    store: "Good Smile Company",
  },
];

function categoryColor(cat: string) {
  switch (cat) {
    case "Merch": return "bg-primary/15 text-primary";
    case "Figures": return "bg-accent/15 text-accent";
    case "Art": return "bg-pink-500/15 text-pink-400";
    case "Gear": return "bg-xp/15 text-xp";
    case "Books": return "bg-success/15 text-success";
    case "Games": return "bg-error/15 text-error";
    default: return "bg-surface-elevated text-text-muted";
  }
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
  const [filter, setFilter] = useState("All");
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const filtered = filter === "All" ? PINS : PINS.filter((p) => p.category === filter);

  function toggleSave(id: number) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Collections</h1>
        <p className="text-text-secondary mt-1">Curated picks for fans — merch, figures, art, gear & more</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              filter === cat
                ? "bg-primary text-white"
                : "bg-surface-elevated text-text-secondary hover:text-foreground hover:bg-surface-elevated/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-text-muted">{filtered.length} items</p>
        {saved.size > 0 && (
          <p className="text-xs text-primary font-semibold">{saved.size} saved</p>
        )}
      </div>

      {/* Masonry grid */}
      <div className="columns-2 sm:columns-2 md:columns-3 gap-3 space-y-3">
        {filtered.map((pin) => (
          <div
            key={pin.id}
            className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-border/50 bg-surface hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
          >
            {/* Image */}
            <div className={`relative overflow-hidden ${pin.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
              <img
                src={pin.image}
                alt={pin.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23161B22' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%23484F58' text-anchor='middle' dy='.3em' font-size='48'%3E%F0%9F%8E%AE%3C/text%3E%3C/svg%3E";
                }}
              />

              {/* Top badges */}
              <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                {pin.tag && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagColor(pin.tag)}`}>
                    {pin.tag}
                  </span>
                )}
                <button
                  onClick={() => toggleSave(pin.id)}
                  className={`ml-auto w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                    saved.has(pin.id)
                      ? "bg-error/90 text-white"
                      : "bg-black/40 text-white/70 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {saved.has(pin.id) ? "♥" : "♡"}
                </button>
              </div>

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">
                {pin.title}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColor(pin.category)}`}>
                  {pin.category}
                </span>
                {pin.price && (
                  <span className="text-sm font-bold text-foreground">{pin.price}</span>
                )}
              </div>
              <p className="text-[10px] text-text-muted mt-1.5">{pin.store}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">No items in this category yet.</p>
        </div>
      )}
    </div>
  );
}
