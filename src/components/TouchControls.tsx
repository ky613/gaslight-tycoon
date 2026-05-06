import { GameState } from "@/game/state";
import { MutableRefObject } from "react";

interface Props {
  keysRef: MutableRefObject<Record<string, boolean>>;
  state: GameState;
}

export default function TouchControls({ keysRef, state }: Props) {
  const set = (k: string, v: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    keysRef.current[k] = v;
  };
  const tap = (k: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    keysRef.current[k] = true;
    setTimeout(() => (keysRef.current[k] = false), 100);
  };

  return (
    <>
      {/* D-pad bottom-left */}
      <div
        className="absolute left-3 bottom-3 grid grid-cols-3 grid-rows-3 gap-1"
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

      {/* Action buttons bottom-right */}
      <div className="absolute right-3 bottom-3 flex flex-col items-end gap-2" style={{ touchAction: "none" }}>
        {state.nearShop && (
          <button
            onPointerDown={tap("e")}
            className="btn-pixel px-3 py-2 text-[10px] pixel-font animate-pulse"
          >
            UPGRADE
          </button>
        )}
        <button
          onPointerDown={set(" ", true)}
          onPointerUp={set(" ", false)}
          onPointerLeave={set(" ", false)}
          onPointerCancel={set(" ", false)}
          className="btn-pixel pixel-font text-sm flex items-center justify-center"
          style={{ width: 90, height: 90, borderRadius: "50%" }}
        >
          PUMP
        </button>
      </div>
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
