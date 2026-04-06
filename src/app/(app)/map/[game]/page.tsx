"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";

const MARKER_CATEGORIES = [
  { id: "bosses", name: "Bosses", icon: "💀", default: true },
  { id: "graces", name: "Sites of Grace", icon: "🔥", default: true },
  { id: "items", name: "Items", icon: "📦", default: true },
  { id: "dungeons", name: "Dungeons", icon: "🏛️", default: true },
  { id: "npcs", name: "NPCs", icon: "👤", default: false },
  { id: "merchants", name: "Merchants", icon: "🛒", default: false },
];

export default function MapPage() {
  const params = useParams();
  const gameKey = params.game as string;
  const config = GAME_REGISTRY[gameKey];

  const [categories, setCategories] = useState(() =>
    MARKER_CATEGORIES.map((c) => ({ ...c, enabled: c.default }))
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!config || config.maps.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">🗺️</span>
        <h3 className="text-xl font-bold mt-4">No map available</h3>
        <p className="text-text-secondary mt-2">Interactive map is not yet available for this game.</p>
        <Link href={`/wiki/${gameKey}`} className="btn-primary inline-block mt-4 text-sm">Browse Wiki Instead</Link>
      </div>
    );
  }

  const mapName = config.maps[0];
  const enabledIds = categories.filter((c) => c.enabled).map((c) => `"${c.id}"`).join(",");

  const mapHtml = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=3,user-scalable=yes">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D1117;overflow:hidden}
#map{width:100vw;height:100vh;background:#0D1117}
.leaflet-popup-content-wrapper{background:#161B22;color:#F0F6FC;border:1px solid #30363D;border-radius:12px}
.leaflet-popup-tip{background:#161B22}
.leaflet-popup-content{font-family:system-ui,sans-serif;font-size:14px}
.leaflet-popup-content h3{margin:0 0 4px;font-size:15px}
.leaflet-popup-content p{margin:0;color:#8B949E;font-size:12px}
</style></head><body>
<div id="map"></div>
<script>
const map=L.map('map',{crs:L.CRS.Simple,minZoom:-2,maxZoom:4,zoomControl:true,attributionControl:false});
map.setView([0,0],0);
fetch('https://${config.wiki}.fandom.com/api.php?action=getmap&name=${encodeURIComponent(mapName)}&format=json')
.then(r=>r.json()).then(data=>{
  if(data&&data.markers){
    const enabled=[${enabledIds}];
    data.markers.forEach(m=>{
      if(m.categoryId&&!enabled.includes(m.categoryId))return;
      L.marker([m.lat||0,m.lng||0]).bindPopup('<h3>'+(m.title||'Unknown')+'</h3>'+(m.description?'<p>'+m.description+'</p>':'')).addTo(map);
    });
  }
  if(data&&data.tileLayers){
    data.tileLayers.forEach(l=>{L.tileLayer(l.url,{bounds:l.bounds?L.latLngBounds(l.bounds):undefined}).addTo(map)});
  }
}).catch(()=>{
  document.getElementById('map').innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#8B949E;font-family:sans-serif"><p>Map data unavailable</p></div>';
});
</script></body></html>`;

  function toggleCategory(id: string) {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c));
  }

  return (
    <div className="relative" style={{ height: "calc(100vh - 120px)" }}>
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href={`/wiki/${gameKey}`} className="text-text-secondary hover:text-foreground transition">←</Link>
            <div>
              <p className="font-semibold text-sm">{config.gameTitle}</p>
              <p className="text-xs text-text-muted">{mapName}</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${showFilters ? "bg-primary text-white" : "bg-surface border border-border text-text-secondary"}`}
          >
            Filter
          </button>
        </div>
        {/* Map search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full rounded-lg bg-surface-elevated border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition"
          />
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="absolute top-16 right-4 z-10 card-glass p-4 w-56">
          <p className="text-xs font-semibold text-text-muted mb-3">Marker Categories</p>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm mb-1 transition ${
                cat.enabled ? "bg-primary/15 text-foreground" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              {cat.enabled && (
                <svg className="w-4 h-4 ml-auto text-primary" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Map iframe */}
      <iframe
        srcDoc={mapHtml}
        className="w-full h-full border-0"
        title={`${config.gameTitle} Map`}
      />

      {/* Attribution */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-2 bg-background/70 backdrop-blur text-center">
        <p className="text-[10px] text-text-muted">
          Map: {config.wiki}.fandom.com — CC BY-SA 3.0 | Leaflet
        </p>
      </div>
    </div>
  );
}
