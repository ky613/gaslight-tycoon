import { GameState } from "@/game/state";

export default function HUD({ state }: { state: GameState }) {
  return (
    <div className="w-full max-w-[1100px] grid grid-cols-2 md:grid-cols-4 gap-2 pixel-font text-[10px]">
      <Stat label="COINS" value={`$${Math.floor(state.coins)}`} accent />
      <Stat label="SERVED" value={String(state.served)} />
      <Stat label="QUEUE" value={`${state.vehicles.length} cars`} />
      <Stat label="BONUS" value={state.bonusActive > 0 ? `x2 ${state.bonusActive.toFixed(1)}s` : "—"} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel p-2 flex flex-col gap-1">
      <div className="text-muted-foreground text-[8px]">{label}</div>
      <div className={accent ? "text-primary text-shadow-pixel" : "text-foreground"}>{value}</div>
    </div>
  );
}
