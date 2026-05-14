import { GameState, TOTAL_LEVELS } from "@/game/state";

export default function LevelResult({
  state,
  onNext,
  onRetry,
}: {
  state: GameState;
  onNext: () => void;
  onRetry: () => void;
}) {
  const win = state.levelResult === "win";
  const cfg = state.levelConfig;
  const last = state.level >= TOTAL_LEVELS;

  return (
    <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-4 z-20">
      <div className="panel p-5 w-full max-w-md pixel-font text-center">
        <h2 className={`text-shadow-pixel text-sm mb-2 ${win ? "text-primary" : "text-destructive"}`}>
          {win ? (last ? "🏆 GAS TYCOON!" : "✓ LEVEL CLEARED!") : "✗ FAILED"}
        </h2>
        <div className="text-[8px] text-muted-foreground mb-3">
          {win ? "Magaling, BOSS!" : "Subukan ulit — wag papagalitin ang VIP!"}
        </div>

        <div className="border-2 border-border p-2 mb-4 text-left space-y-1">
          <Row label="COINS" v={`$${Math.floor(state.levelStats.coins)}/${cfg.coinTarget}`} ok={state.levelStats.coins >= cfg.coinTarget} />
          <Row label="VIP SERVED" v={`${state.levelStats.vipsServed}/${cfg.vipNeeded}`} ok={state.levelStats.vipsServed >= cfg.vipNeeded} />
          <Row label="RAGE-QUITS" v={`${state.levelStats.rageQuits}/${cfg.maxRageQuits}`} ok={state.levelStats.rageQuits <= cfg.maxRageQuits} />
        </div>

        {win && !last && (
          <button onClick={onNext} className="btn-pixel w-full py-3 text-xs">NEXT LEVEL →</button>
        )}
        {win && last && (
          <button onClick={onRetry} className="btn-pixel w-full py-3 text-xs">PLAY AGAIN</button>
        )}
        {!win && (
          <button onClick={onRetry} className="btn-pixel w-full py-3 text-xs">RETRY</button>
        )}
      </div>
    </div>
  );
}

function Row({ label, v, ok }: { label: string; v: string; ok: boolean }) {
  return (
    <div className="flex justify-between text-[8px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={ok ? "text-primary" : "text-destructive"}>{ok ? "✓ " : "✗ "}{v}</span>
    </div>
  );
}
