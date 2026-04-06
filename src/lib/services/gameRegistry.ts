export interface GameWikiConfig {
  gameTitle: string;
  wiki: string;
  categories: {
    characters?: string;
    items?: string;
    weapons?: string;
    armor?: string;
    locations?: string;
    bosses?: string;
    quests?: string;
    walkthroughs?: string;
  };
  infoboxTemplates: Record<string, string>;
  maps: string[];
}

export const GAME_REGISTRY: Record<string, GameWikiConfig> = {
  "elden-ring": {
    gameTitle: "Elden Ring",
    wiki: "eldenring",
    categories: { characters: "Characters", items: "Items", weapons: "Weapons", armor: "Armor", locations: "Locations", bosses: "Bosses", quests: "Quests" },
    infoboxTemplates: { character: "Infobox character", weapon: "Infobox weapon", boss: "Infobox boss" },
    maps: ["The Lands Between"],
  },
  "skyrim": {
    gameTitle: "The Elder Scrolls V: Skyrim",
    wiki: "elderscrolls",
    categories: { characters: "Skyrim: Characters", items: "Skyrim: Items", weapons: "Skyrim: Weapons", locations: "Skyrim: Locations", quests: "Skyrim: Quests" },
    infoboxTemplates: { character: "Infobox Character", weapon: "Infobox Weapon" },
    maps: ["Skyrim Map"],
  },
  "fallout-4": {
    gameTitle: "Fallout 4",
    wiki: "fallout",
    categories: { characters: "Fallout 4 characters", items: "Fallout 4 items", weapons: "Fallout 4 weapons", locations: "Fallout 4 locations", quests: "Fallout 4 quests" },
    infoboxTemplates: { character: "Infobox character", weapon: "Infobox item" },
    maps: ["Commonwealth Map"],
  },
  "genshin-impact": {
    gameTitle: "Genshin Impact",
    wiki: "genshin-impact",
    categories: { characters: "Playable Characters", items: "Items", weapons: "Weapons", locations: "Locations", bosses: "Bosses", quests: "Archon Quests" },
    infoboxTemplates: { character: "Infobox Character", weapon: "Infobox Weapon" },
    maps: ["Teyvat Interactive Map"],
  },
  "zelda-totk": {
    gameTitle: "The Legend of Zelda: Tears of the Kingdom",
    wiki: "zelda",
    categories: { characters: "Tears of the Kingdom Characters", items: "Tears of the Kingdom Items", weapons: "Tears of the Kingdom Weapons", locations: "Tears of the Kingdom Locations", bosses: "Tears of the Kingdom Bosses" },
    infoboxTemplates: { character: "Infobox Character", item: "Infobox Item" },
    maps: ["Hyrule Map"],
  },
};

export function findWikiConfig(gameTitle: string): GameWikiConfig | null {
  const lower = gameTitle.toLowerCase();
  for (const [key, config] of Object.entries(GAME_REGISTRY)) {
    if (lower.includes(key.replace(/-/g, " ")) || config.gameTitle.toLowerCase().includes(lower)) {
      return config;
    }
  }
  return null;
}
