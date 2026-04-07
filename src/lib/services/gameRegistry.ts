export interface GameWikiConfig {
  gameTitle: string;
  wiki: string;
  cover: string;
  igdbId: string;
  genre: string;
  categories: {
    characters?: string;
    items?: string;
    weapons?: string;
    armor?: string;
    locations?: string;
    bosses?: string;
    quests?: string;
    walkthroughs?: string;
    boons?: string;
    fish?: string;
    crops?: string;
    missions?: string;
  };
  infoboxTemplates: Record<string, string>;
  maps: string[];
  mapUrl?: string; // External interactive map URL to embed
}

export const GAME_REGISTRY: Record<string, GameWikiConfig> = {
  "elden-ring": {
    gameTitle: "Elden Ring",
    wiki: "eldenring",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
    igdbId: "igdb-119133",
    genre: "Action RPG",
    categories: { characters: "Characters", items: "Items", weapons: "Weapons", armor: "Armor", locations: "Locations", bosses: "Bosses", quests: "Quests" },
    infoboxTemplates: { character: "Infobox character", weapon: "Infobox weapon", boss: "Infobox boss" },
    maps: ["The Lands Between"],
    mapUrl: "https://eldenring.wiki.fextralife.com/Interactive+Map",
  },
  "skyrim": {
    gameTitle: "The Elder Scrolls V: Skyrim",
    wiki: "elderscrolls",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.jpg",
    igdbId: "igdb-472",
    genre: "Open World RPG",
    categories: { characters: "Skyrim: Characters", items: "Skyrim: Items", weapons: "Skyrim: Weapons", armor: "Skyrim: Armor", locations: "Skyrim: Locations", quests: "Skyrim: Quests" },
    infoboxTemplates: { character: "Infobox Character", weapon: "Infobox Weapon" },
    maps: ["Skyrim Map"],
    mapUrl: "https://srmap.uesp.net/",
  },
  "fallout-4": {
    gameTitle: "Fallout 4",
    wiki: "fallout",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rc7.jpg",
    igdbId: "igdb-9630",
    genre: "Action RPG",
    categories: { characters: "Fallout 4 characters", items: "Fallout 4 items", weapons: "Fallout 4 weapons", armor: "Fallout 4 armor and clothing", locations: "Fallout 4 locations", quests: "Fallout 4 quests" },
    infoboxTemplates: { character: "Infobox character", weapon: "Infobox item" },
    maps: ["Commonwealth Map"],
    mapUrl: "https://fo4map.com/",
  },
  "genshin-impact": {
    gameTitle: "Genshin Impact",
    wiki: "genshin-impact",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3s3x.jpg",
    igdbId: "igdb-119277",
    genre: "Action RPG",
    categories: { characters: "Playable Characters", items: "Items", weapons: "Weapons", locations: "Locations", bosses: "Bosses", quests: "Archon Quests" },
    infoboxTemplates: { character: "Infobox Character", weapon: "Infobox Weapon" },
    maps: ["Teyvat Interactive Map"],
    mapUrl: "https://act.hoyolab.com/ys/app/interactive-map/index.html",
  },
  "zelda-totk": {
    gameTitle: "Zelda: Tears of the Kingdom",
    wiki: "zelda",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
    igdbId: "igdb-119388",
    genre: "Adventure",
    categories: { characters: "Tears of the Kingdom Characters", items: "Tears of the Kingdom Items", weapons: "Tears of the Kingdom Weapons", locations: "Tears of the Kingdom Locations", bosses: "Tears of the Kingdom Bosses" },
    infoboxTemplates: { character: "Infobox Character", item: "Infobox Item" },
    maps: ["Hyrule Map"],
    mapUrl: "https://www.zeldadungeon.net/tears-of-the-kingdom-interactive-map/",
  },
  "witcher-3": {
    gameTitle: "The Witcher 3: Wild Hunt",
    wiki: "witcher",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
    igdbId: "igdb-1942",
    genre: "RPG",
    categories: { characters: "The Witcher 3 characters", weapons: "The Witcher 3 weapons", armor: "The Witcher 3 armor", locations: "The Witcher 3 locations", quests: "The Witcher 3 quests" },
    infoboxTemplates: { character: "Infobox Character" },
    maps: [],
  },
  "gta-v": {
    gameTitle: "Grand Theft Auto V",
    wiki: "gta",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg",
    igdbId: "igdb-239064",
    genre: "Action",
    categories: { characters: "Characters in GTA V", weapons: "Weapons in GTA V", locations: "Locations in GTA V", missions: "Missions in GTA V" },
    infoboxTemplates: {},
    maps: [],
  },
  "god-of-war": {
    gameTitle: "God of War (2018)",
    wiki: "godofwar",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg",
    igdbId: "igdb-19560",
    genre: "Action",
    categories: { characters: "Characters", locations: "Locations", bosses: "Bosses", items: "Items" },
    infoboxTemplates: {},
    maps: [],
  },
  "hades": {
    gameTitle: "Hades",
    wiki: "hades",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2hct.jpg",
    igdbId: "igdb-80529",
    genre: "Roguelike",
    categories: { characters: "Characters", weapons: "Weapons", bosses: "Bosses", boons: "Boons" },
    infoboxTemplates: {},
    maps: [],
  },
  "stardew-valley": {
    gameTitle: "Stardew Valley",
    wiki: "stardewvalley",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/xrpmydnu9rpxvxfjkiu7.jpg",
    igdbId: "igdb-17000",
    genre: "Simulation",
    categories: { characters: "Characters", items: "Items", locations: "Locations", fish: "Fish", crops: "All Year Crops" },
    infoboxTemplates: {},
    maps: [],
  },
  "baldurs-gate-3": {
    gameTitle: "Baldur's Gate III",
    wiki: "baldursgate3",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg",
    igdbId: "igdb-119171",
    genre: "RPG",
    categories: { characters: "Companions", items: "Items", weapons: "Weapons", armor: "Armor", locations: "Locations", quests: "Quests" },
    infoboxTemplates: {},
    maps: [],
  },
  "cyberpunk-2077": {
    gameTitle: "Cyberpunk 2077",
    wiki: "cyberpunk",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.jpg",
    igdbId: "igdb-1877",
    genre: "Action RPG",
    categories: { characters: "Cyberpunk 2077 Characters", weapons: "Cyberpunk 2077 Weapons", quests: "Cyberpunk 2077 Quests", locations: "Cyberpunk 2077 Locations" },
    infoboxTemplates: {},
    maps: [],
  },
  "minecraft": {
    gameTitle: "Minecraft",
    wiki: "minecraft",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co8fu7.jpg",
    igdbId: "igdb-135400",
    genre: "Sandbox",
    categories: { items: "Items", weapons: "Weapons", bosses: "Mobs", locations: "Biomes" },
    infoboxTemplates: {},
    maps: [],
  },
  "starfield": {
    gameTitle: "Starfield",
    wiki: "starfield",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co39vv.jpg",
    igdbId: "igdb-96437",
    genre: "Action RPG",
    categories: { characters: "Companions", weapons: "Weapons", armor: "Armor", locations: "Locations", quests: "Quests" },
    infoboxTemplates: {},
    maps: [],
  },
  "outer-wilds": {
    gameTitle: "Outer Wilds",
    wiki: "outerwilds",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co65ac.jpg",
    igdbId: "igdb-11737",
    genre: "Adventure",
    categories: { characters: "Characters", locations: "Locations", items: "Items" },
    infoboxTemplates: {},
    maps: [],
  },
};

// Also match by IGDB ID
export function findWikiConfigByIgdbId(igdbId: string): { key: string; config: GameWikiConfig } | null {
  for (const [key, config] of Object.entries(GAME_REGISTRY)) {
    if (config.igdbId === igdbId) return { key, config };
  }
  return null;
}

export function findWikiConfig(gameTitle: string): GameWikiConfig | null {
  const lower = gameTitle.toLowerCase();

  // Exact key match
  for (const [key, config] of Object.entries(GAME_REGISTRY)) {
    if (lower === config.gameTitle.toLowerCase()) return config;
  }

  // Key-in-title match
  for (const [key, config] of Object.entries(GAME_REGISTRY)) {
    const keyWords = key.replace(/-/g, " ");
    if (lower.includes(keyWords) || config.gameTitle.toLowerCase().includes(lower) || lower.includes(config.gameTitle.toLowerCase())) {
      return config;
    }
  }

  // Partial match — require at least 2 significant words to match to avoid false positives
  for (const config of Object.values(GAME_REGISTRY)) {
    const words = config.gameTitle.toLowerCase().split(/[\s:()]+/).filter((w) => w.length > 3);
    const matchCount = words.filter((w) => lower.includes(w)).length;
    if (matchCount >= 2 || (words.length === 1 && matchCount === 1)) return config;
  }

  return null;
}
