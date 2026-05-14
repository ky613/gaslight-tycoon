import { Character, GameState } from "@/game/state";

export default function CharacterSelect({ state, onPick }: { state: GameState; onPick: (c: Character) => void }) {
  return (
    <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-4 z-20">
      <div className="panel p-5 w-full max-w-md pixel-font text-center">
        <h2 className="text-primary text-shadow-pixel text-sm mb-1">⛽ GASLIGHTER</h2>
        <div className="text-[8px] text-muted-foreground mb-4">PUMILI NG CHARACTER</div>
        <div className="grid grid-cols-2 gap-3">
          {(["boy", "girl"] as Character[]).map((c) => (
            <button
              key={c}
              onClick={() => onPick(c)}
              className={`btn-pixel py-3 text-[10px] flex flex-col items-center gap-2 ${state.character === c ? "ring-2 ring-primary" : ""}`}
            >
              <span className="text-2xl">{c === "boy" ? "👦" : "👧"}</span>
              <span>{c === "boy" ? "BOY" : "GIRL"}</span>
            </button>
          ))}
        </div>
        <div className="text-[8px] text-muted-foreground mt-4 leading-relaxed">
          Madaanan ang 10 levels — bote-bote → mega station empire.
        </div>
      </div>
    </div>
  );
}
