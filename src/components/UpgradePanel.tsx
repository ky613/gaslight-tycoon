import { GameState } from "@/game/state";
import { useState } from "react";

export default function UpgradePanel({ state, onClose }: { state: GameState; onClose: () => void }) {
  const [, set] = useState(0);
  const u = state.levelConfig.upgrade;
  const lvl = state.upgrades[u.key];
  const can = lvl < 1 && state.coins >= u.cost; // 1 upgrade per level

  const buy = () => {
    if (!can) return;
    state.coins -= u.cost;
    state.upgrades[u.key] = lvl + 1;
    set((n) => n + 1);
  };

  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4 z-10">
      <div className="panel p-4 w-full max-w-md pixel-font">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-primary text-shadow-pixel text-sm">⚙ LEVEL {state.level} UPGRADE</h2>
          <button onClick={onClose} className="btn-pixel px-2 py-1 text-[10px]">CLOSE</button>
        </div>
        <div className="border-2 border-border p-3 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-foreground text-[10px]">{u.name} <span className="text-accent">{lvl > 0 ? "OWNED" : ""}</span></div>
            <div className="text-muted-foreground text-[8px] mt-1">{u.desc}</div>
          </div>
          <button onClick={buy} disabled={!can} className="btn-pixel px-2 py-1 text-[9px] whitespace-nowrap">
            {lvl > 0 ? "✓ BOUGHT" : `$${u.cost}`}
          </button>
        </div>
        <div className="mt-3 text-[8px] text-muted-foreground text-center">
          1 upgrade per level only. Coins: <span className="text-primary">${Math.floor(state.coins)}</span>
        </div>
      </div>
    </div>
  );
}
