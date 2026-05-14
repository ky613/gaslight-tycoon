import { GameState } from "@/game/state";

export default function HUD({ state }: { state: GameState }) {
  const cfg = state.levelConfig;
  return (
    <div className="flex items-center gap-1 sm:gap-2 pixel-font text-[8px] sm:text-[10px] flex-wrap justify-end">
      <Stat label="LV" value={`${state.level}/10`} />
      <Stat label="$" value={`${Math.floor(state.coins)}/${cfg.coinTarget}`} accent />
      <Stat label="VIP" value={`${state.levelStats.vipsServed}/${cfg.vipNeeded}`} />
      <Stat label="RAGE" value={`${state.levelStats.rageQuits}/${cfg.maxRageQuits}`} danger={state.levelStats.rageQuits >= cfg.maxRageQuits} />
    </div>
  );
}

function Stat({ label, value, accent, danger }: { label: string; value: string; accent?: boolean; danger?: boolean }) {
  return (
    <div className={`px-2 py-1 border-2 border-border bg-secondary/60 ${accent ? "text-primary text-shadow-pixel" : danger ? "text-destructive" : "text-foreground"}`}>
      <span className="text-muted-foreground mr-1">{label}</span>{value}
    </div>
  );
}
