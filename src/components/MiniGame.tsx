import { GameState } from "@/game/state";
import { useEffect, useRef, useState } from "react";

export default function MiniGame({ state, onClose }: { state: GameState; onClose: (success: boolean) => void }) {
  const mg = state.miniGame!;
  const [, set] = useState(0);
  const lastT = useRef(performance.now());

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      const dt = (t - lastT.current) / 1000;
      lastT.current = t;
      mg.t -= dt;
      if (mg.progress >= mg.target) { onClose(true); return; }
      if (mg.t <= 0) { onClose(false); return; }
      set((n) => n + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mg, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key.toLowerCase() === "e") {
        e.preventDefault();
        mg.progress += 1;
        set((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mg]);

  const pct = Math.min(100, (mg.progress / mg.target) * 100);
  const isTire = mg.kind === "tire";

  return (
    <div className="absolute inset-0 bg-background/85 flex items-center justify-center p-4">
      <div className="panel p-5 max-w-sm w-full pixel-font text-center">
        <div className="text-primary text-shadow-pixel text-sm mb-2">
          {isTire ? "🛞 TIRE PUMP!" : "⚡ x2 BONUS ROUND!"}
        </div>
        <div className="text-[9px] text-muted-foreground mb-4">
          {isTire
            ? "A flat tire blocks the pump! Mash SPACE to inflate it before time runs out."
            : "Mash SPACE to unlock 30 seconds of x2 coins & speed!"}
        </div>

        <div className="mb-4 flex items-center justify-center">
          <TireOrBolt isTire={isTire} pct={pct} />
        </div>

        <div className="h-3 w-full bg-secondary border-2 border-border mb-2">
          <div
            className="h-full transition-[width] duration-75"
            style={{ width: `${pct}%`, background: pct > 80 ? "hsl(var(--primary))" : "hsl(var(--accent))" }}
          />
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground">
          <span>{mg.progress}/{mg.target} pumps</span>
          <span className={mg.t < 2 ? "text-destructive" : ""}>{mg.t.toFixed(1)}s</span>
        </div>

        <button
          className="btn-pixel mt-4 px-4 py-2 text-[10px] w-full"
          onClick={() => { mg.progress += 1; set((n) => n + 1); }}
        >
          PUMP! (SPACE)
        </button>
      </div>
    </div>
  );
}

function TireOrBolt({ isTire, pct }: { isTire: boolean; pct: number }) {
  // pixel-art SVG-ish using divs
  const size = 80;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {isTire ? (
        <div
          className="absolute inset-0 rounded-full border-[10px] border-foreground"
          style={{
            transform: `scale(${0.6 + (pct / 100) * 0.4})`,
            transition: "transform 0.08s",
            background: "radial-gradient(circle, hsl(var(--secondary)) 30%, hsl(var(--muted)) 60%)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-primary"
          style={{ fontSize: 50, transform: `scale(${0.7 + (pct / 100) * 0.5})`, transition: "transform 0.08s" }}
        >
          ⚡
        </div>
      )}
    </div>
  );
}
