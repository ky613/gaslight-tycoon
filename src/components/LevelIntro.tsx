import { GameState } from "@/game/state";

export default function LevelIntro({ state, onStart }: { state: GameState; onStart: () => void }) {
  const cfg = state.levelConfig;
  return (
    <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-4 z-20">
      <div className="panel p-5 w-full max-w-md pixel-font text-center">
        <div className="text-[8px] text-muted-foreground">LEVEL {cfg.level} / 10</div>
        <h2 className="text-primary text-shadow-pixel text-sm mt-1 mb-2">{cfg.title.toUpperCase()}</h2>
        <p className="text-[8px] text-muted-foreground leading-relaxed mb-4">{cfg.story}</p>

        <div className="border-2 border-border p-2 mb-3 text-left">
          <div className="text-accent text-[9px] mb-2">🎯 GOALS</div>
          <Row label="COINS" value={`$${cfg.coinTarget}`} />
          <Row label="VIP SERVED" value={`${cfg.vipNeeded}`} />
          <Row label="MAX RAGE-QUITS" value={`${cfg.maxRageQuits}`} />
        </div>

        <div className="border-2 border-border p-2 mb-4 text-left">
          <div className="text-accent text-[9px] mb-1">⚙ AVAILABLE UPGRADE</div>
          <div className="text-[9px]">{cfg.upgrade.name} <span className="text-muted-foreground">${cfg.upgrade.cost}</span></div>
          <div className="text-[7px] text-muted-foreground mt-1">{cfg.upgrade.desc}</div>
        </div>

        <button onClick={onStart} className="btn-pixel w-full py-3 text-xs">START LEVEL {cfg.level}</button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[8px] mt-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-primary">{value}</span>
    </div>
  );
}
