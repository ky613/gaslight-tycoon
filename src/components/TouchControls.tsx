import { GameState } from "@/game/state";
import { MutableRefObject } from "react";

interface Props {
  keysRef: MutableRefObject<Record<string, boolean>>;
  state: GameState;
  onUpgrade: () => void;
}

export default function TouchControls({ keysRef, state, onUpgrade }: Props) {
  const press = (k: string, v: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    keysRef.current[k] = v;
  };
  const tap = (k: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    keysRef.current[k] = true;
    setTimeout(() => (keysRef.current[k] = false), 80);
  };

  return (
    <div className="w-full max-w-[1200px] flex items-end justify-between gap-3 pixel-font">
      {/* D-pad */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-[150px] h-[150px] md:w-[170px] md:h-[170px]">
        <div />
        <DBtn label="▲" downKey="arrowup" keysRef={keysRef} />
        <div />
        <DBtn label="◀" downKey="arrowleft" keysRef={keysRef} />
        <div className="bg-secondary border-2 border-border" />
        <DBtn label="▶" downKey="arrowright" keysRef={keysRef} />
        <div />
        <DBtn label="▼" downKey="arrowdown" keysRef={keysRef} />
        <div />
      </div>

      {/* Action */}
      <div className="flex flex-col gap-2 items-end">
        <button
          onPointerDown={press(" ", true)}
          onPointerUp={press(" ", false)}
          onPointerLeave={press(" ", false)}
          onPointerCancel={press(" ", false)}
          className="btn-pixel w-24 h-24 md:w-28 md:h-28 text-xs rounded-full active:translate-y-0"
          style={{ borderRadius: "50%" }}
        >
          PUMP
        </button>
        <button
          onPointerDown={tap("e")}
          disabled={!state.nearShop}
          className="btn-pixel px-3 py-2 text-[9px]"
        >
          UPGRADE (E)
        </button>
      </div>
    </div>
  );
}

function DBtn({ label, downKey, keysRef }: { label: string; downKey: string; keysRef: MutableRefObject<Record<string, boolean>> }) {
  const set = (v: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    keysRef.current[downKey] = v;
  };
  return (
    <button
      onPointerDown={set(true)}
      onPointerUp={set(false)}
      onPointerLeave={set(false)}
      onPointerCancel={set(false)}
      className="btn-pixel text-sm flex items-center justify-center"
    >
      {label}
    </button>
  );
}
