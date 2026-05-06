import { GameState } from "@/game/state";
import { useEffect, useRef, useState } from "react";

export default function MiniGame({ state, onClose }: { state: GameState; onClose: (success: boolean) => void }) {
  const mg = state.miniGame!;
  const [, set] = useState(0);
  const lastT = useRef(performance.now());
  const [shake, setShake] = useState(0);

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

  const pump = () => {
    mg.progress += 1;
    setShake((n) => n + 1);
    set((n) => n + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key.toLowerCase() === "e") {
        e.preventDefault();
        pump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pct = Math.min(100, (mg.progress / mg.target) * 100);
  const isTire = mg.kind === "tire";
  const danger = mg.t < 2;

  return (
    <div className="absolute inset-0 bg-background/90 backdrop-blur-[2px] flex items-center justify-center p-3 z-10">
      <div
        className="panel p-4 max-w-sm w-full pixel-font text-center"
        style={{ transform: `translate(${(shake % 2 ? 1 : -1) * 1}px, 0)` }}
      >
        <div className={`text-shadow-pixel text-sm mb-2 ${isTire ? "text-accent" : "text-primary"}`}>
          {isTire ? "FLAT TIRE!" : "BONUS x2 ROUND!"}
        </div>
        <div className="text-[9px] text-muted-foreground mb-3 leading-relaxed">
          {isTire
            ? "Mash PUMP to inflate the tire before time runs out!"
            : "Mash PUMP to unlock 30s of x2 coins + speed!"}
        </div>

        <div className="mb-3 flex items-center justify-center h-[120px]">
          {isTire ? <PixelTire pct={pct} /> : <PixelBolt pct={pct} />}
        </div>

        {/* segmented pixel bar */}
        <div className="flex gap-[2px] mb-2 h-4 border-2 border-border bg-background p-[2px]">
          {Array.from({ length: 20 }).map((_, i) => {
            const filled = (i + 1) / 20 <= pct / 100;
            return (
              <div
                key={i}
                className="flex-1"
                style={{
                  background: filled
                    ? (pct > 80 ? "hsl(var(--primary))" : isTire ? "hsl(var(--accent))" : "hsl(var(--neon-green))")
                    : "hsl(var(--secondary))",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground mb-3">
          <span>{mg.progress}/{mg.target} PUMPS</span>
          <span className={danger ? "text-destructive animate-pulse" : ""}>{mg.t.toFixed(1)}s</span>
        </div>

        <button
          onPointerDown={(e) => { e.preventDefault(); pump(); }}
          className="btn-pixel w-full py-3 text-xs"
        >
          PUMP! (SPACE)
        </button>
      </div>
    </div>
  );
}

function PixelTire({ pct }: { pct: number }) {
  // 11x11 grid of pixel "blocks"
  const size = 11;
  const cells: string[] = [];
  const cx = (size - 1) / 2, cy = (size - 1) / 2;
  const r = 5, ir = 2;
  // inflation grows
  const scale = 0.55 + (pct / 100) * 0.45;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx, y - cy);
      let c = "transparent";
      if (d <= r && d > r - 1.2) c = "hsl(var(--foreground))"; // tread
      else if (d <= r - 1.2 && d > ir + 0.5) c = "#1a1a1a"; // tire rubber
      else if (d <= ir + 0.5 && d > ir - 0.6) c = "hsl(var(--muted-foreground))"; // rim
      else if (d <= ir - 0.6) c = "hsl(var(--secondary))"; // hub
      cells.push(c);
    }
  }
  // tread marks
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tx = Math.round(cx + Math.cos(a) * (r - 0.5));
    const ty = Math.round(cy + Math.sin(a) * (r - 0.5));
    if (tx >= 0 && tx < size && ty >= 0 && ty < size) {
      cells[ty * size + tx] = "hsl(var(--muted-foreground))";
    }
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${size}, 8px)`,
        gridTemplateRows: `repeat(${size}, 8px)`,
        transform: `scale(${scale})`,
        transition: "transform 80ms ease-out",
        imageRendering: "pixelated",
      }}
    >
      {cells.map((c, i) => (
        <div key={i} style={{ width: 8, height: 8, background: c }} />
      ))}
    </div>
  );
}

function PixelBolt({ pct }: { pct: number }) {
  // pixel lightning bolt grid (8 wide x 11 tall), filled rows reveal as pct grows
  const map = [
    "....11..",
    "...11...",
    "..11....",
    ".111....",
    "1111111.",
    "...11...",
    "..11....",
    "..11....",
    ".11.....",
    "11......",
    "1.......",
  ];
  const reveal = Math.ceil((pct / 100) * map.length);
  const glow = pct > 80;
  return (
    <div className="relative">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(8, 9px)`,
          gridTemplateRows: `repeat(${map.length}, 9px)`,
          imageRendering: "pixelated",
          filter: glow ? "drop-shadow(0 0 6px hsl(var(--primary)))" : undefined,
        }}
      >
        {map.flatMap((row, ri) =>
          row.split("").map((ch, ci) => (
            <div
              key={`${ri}-${ci}`}
              style={{
                width: 9,
                height: 9,
                background:
                  ch === "1" && ri >= map.length - reveal
                    ? "hsl(var(--primary))"
                    : ch === "1"
                    ? "hsl(var(--secondary))"
                    : "transparent",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
