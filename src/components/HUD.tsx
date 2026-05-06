import { GameState } from "@/game/state";

export default function HUD({ state }: { state: GameState }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 pixel-font text-[8px] sm:text-[10px]">
      <Stat label="$" value={Math.floor(state.coins).toString()} accent />
      <Stat label="SVD" value={String(state.served)} />
      <Stat label="CARS" value={`${state.vehicles.length}`} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`px-2 py-1 border-2 border-border bg-secondary/60 ${accent ? "text-primary text-shadow-pixel" : "text-foreground"}`}>
      <span className="text-muted-foreground mr-1">{label}</span>{value}
    </div>
  );
}
