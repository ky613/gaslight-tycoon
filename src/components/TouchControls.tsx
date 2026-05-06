import { GameState } from "@/game/state";
import { MutableRefObject } from "react";

interface Props {
  keysRef: MutableRefObject<Record<string, boolean>>;
  state: GameState;
  onOpenUpgrade: () => void;
}

export default function TouchControls({ keysRef, state, onOpenUpgrade }: Props) {
  const set = (k: string, v: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    keysRef.current[k] = v;
  };

  return (
    <>
      {/* Always-visible UPGRADE button at top-right */}
      <button
        onPointerDown={(e) => { e.preventDefault(); onOpenUpgrade(); }}
        className="absolute top-2 right-2 btn-pixel pixel-font px-3 py-2 text-[10px] flex items-center gap-1 z-10"
      >
        ⚙ UPGRADE
      </button>
      {state.nearShop && (
        <div className="absolute top-14 right-2 panel pixel-font text-[8px] px-2 py-1 text-primary text-shadow-pixel z-10">
          AT SHOP!
        </div>
      )}

      {/* D-pad bottom-left */}
      <div
        className="absolute left-3 bottom-3 grid grid-cols-3 grid-rows-3 gap-1 z-10"
        style={{ width: 168, height: 168, touchAction: "none" }}
      >
        <div />
        <DBtn label="▲" k="arrowup" set={set} />
        <div />
        <DBtn label="◀" k="arrowleft" set={set} />
        <div className="bg-secondary/40 border-2 border-border rounded-sm" />
        <DBtn label="▶" k="arrowright" set={set} />
        <div />
        <DBtn label="▼" k="arrowdown" set={set} />
        <div />
      </div>

      {/* PUMP button bottom-right */}
      <button
        onPointerDown={set(" ", true)}
        onPointerUp={set(" ", false)}
        onPointerLeave={set(" ", false)}
        onPointerCancel={set(" ", false)}
        className="absolute right-4 bottom-4 btn-pixel pixel-font text-sm flex items-center justify-center z-10"
        style={{ width: 96, height: 96, borderRadius: "50%", touchAction: "none" }}
      >
        PUMP
      </button>
    </>
  );
}

function DBtn({
  label,
  k,
  set,
}: {
  label: string;
  k: string;
  set: (k: string, v: boolean) => (e: React.PointerEvent) => void;
}) {
  return (
    <button
      onPointerDown={set(k, true)}
      onPointerUp={set(k, false)}
      onPointerLeave={set(k, false)}
      onPointerCancel={set(k, false)}
      className="btn-pixel pixel-font text-sm flex items-center justify-center"
    >
      {label}
    </button>
  );
}
