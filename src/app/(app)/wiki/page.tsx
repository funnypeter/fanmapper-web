import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";

const COVER_MAP: Record<string, string> = {
  "elden-ring": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
  "skyrim": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.jpg",
  "fallout-4": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rc7.jpg",
  "genshin-impact": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3s3x.jpg",
  "zelda-totk": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
};

export default function WikiIndexPage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-2">
          Game <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Wikis</span>
        </h2>
        <p className="text-text-secondary">Track your progress with checklists for characters, items, bosses, and more</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
        {Object.entries(GAME_REGISTRY).map(([key, config]) => (
          <Link
            key={key}
            href={`/wiki/${key}`}
            className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
          >
            {COVER_MAP[key] ? (
              <img src={COVER_MAP[key]} alt={config.gameTitle} className="w-full aspect-[3/4] object-cover" />
            ) : (
              <div className="w-full aspect-[3/4] bg-surface-elevated flex items-center justify-center text-3xl">📖</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-semibold text-sm text-white">{config.gameTitle}</p>
              <p className="text-xs text-white/50 mt-0.5">{Object.keys(config.categories).length} categories</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-text-muted text-sm">More games coming soon</p>
        <p className="text-xs text-text-muted mt-2">Wiki content from Fandom — Licensed under CC BY-SA 3.0</p>
      </div>
    </div>
  );
}
