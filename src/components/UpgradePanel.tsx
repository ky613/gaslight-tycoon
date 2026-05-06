import { GameState } from "@/game/state";
import { useState } from "react";

interface Def {
  key: keyof GameState["upgrades"];
  name: string;
  desc: string;
  base: number;
  scale: number;
  max: number;
}

const DEFS: Def[] = [
  { key: "pumpSpeed", name: "Pump Speed", desc: "+8 fuel/sec per level", base: 80, scale: 1.6, max: 8 },
  { key: "walk",      name: "Boots",       desc: "Walk faster",            base: 60, scale: 1.5, max: 6 },
  { key: "pumps",     name: "Extra Lane",  desc: "+1 max cars at station", base: 250, scale: 2.0, max: 3 },
  { key: "coinMult",  name: "Logo Deal",   desc: "+50% coins per level",   base: 300, scale: 1.9, max: 5 },
];

function cost(d: Def, lvl: number) {
  return Math.floor(d.base * Math.pow(d.scale, lvl));
}

export default function UpgradePanel({ state, onClose }: { state: GameState; onClose: () => void }) {
  const [, set] = useState(0);
  const buy = (d: Def) => {
    const lvl = state.upgrades[d.key];
    if (lvl >= d.max) return;
    const c = cost(d, lvl);
    if (state.coins < c) return;
    state.coins -= c;
    state.upgrades[d.key] = lvl + 1;
    set((n) => n + 1);
  };

  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
      <div className="panel p-4 w-full max-w-md pixel-font">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-primary text-shadow-pixel text-sm">⚙ UPGRADES</h2>
          <button onClick={onClose} className="btn-pixel px-2 py-1 text-[10px]">CLOSE</button>
        </div>
        <div className="space-y-2">
          {DEFS.map((d) => {
            const lvl = state.upgrades[d.key];
            const maxed = lvl >= d.max;
            const c = cost(d, lvl);
            const can = !maxed && state.coins >= c;
            return (
              <div key={d.key} className="border-2 border-border p-2 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-foreground text-[10px]">{d.name} <span className="text-accent">Lv {lvl}/{d.max}</span></div>
                  <div className="text-muted-foreground text-[8px] mt-1">{d.desc}</div>
                </div>
                <button
                  onClick={() => buy(d)}
                  disabled={!can}
                  className="btn-pixel px-2 py-1 text-[9px] whitespace-nowrap"
                >
                  {maxed ? "MAX" : `$${c}`}
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[8px] text-muted-foreground text-center">
          Coins: <span className="text-primary">${Math.floor(state.coins)}</span>
        </div>
      </div>
    </div>
  );
}
