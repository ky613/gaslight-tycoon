import { useEffect, useRef, useState } from "react";
import { drawScene, drawSprites } from "@/game/render";
import { createInitialState, GameState, Vehicle, VehicleKind } from "@/game/state";
import { TILE, MAP_W, MAP_H, PUMP_SPOTS } from "@/game/world";
import UpgradePanel from "@/components/UpgradePanel";
import HUD from "@/components/HUD";
import MiniGame from "@/components/MiniGame";
import TouchControls from "@/components/TouchControls";

type Keys = Record<string, boolean>;

export default function GaslighterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const keysRef = useRef<Keys>({});
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  useEffect(() => {
    const id = setInterval(rerender, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    let raf = 0;
    let last = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      update(stateRef.current, keysRef.current, dt);
      const s = stateRef.current;
      const viewW = canvas.width, viewH = canvas.height;
      s.cam.x = Math.max(0, Math.min(MAP_W * TILE - viewW, s.player.x - viewW / 2));
      s.cam.y = Math.max(0, Math.min(MAP_H * TILE - viewH, s.player.y - viewH / 2));
      drawScene(ctx, s, viewW, viewH);
      drawSprites(ctx, s);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()) || e.key === " ") {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    // ensure focus
    window.focus();
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const s = stateRef.current;

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center p-2 gap-2 select-none">
      <header className="w-full max-w-[1200px] flex items-center justify-between px-1">
        <h1 className="pixel-font text-primary text-shadow-pixel text-base md:text-2xl">
          ⛽ GASLIGHTER
        </h1>
        <p className="pixel-font text-[8px] md:text-xs text-muted-foreground hidden sm:block">
          WASD/Arrows · SPACE pump · E upgrade
        </p>
      </header>

      <HUD state={s} />

      <div className="relative panel w-full max-w-[1200px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          tabIndex={0}
          onClick={(e) => (e.currentTarget as HTMLCanvasElement).focus()}
          className="block w-full h-auto outline-none"
          style={{ aspectRatio: "8/5", imageRendering: "pixelated" }}
        />
        {s.upgradeOpen && <UpgradePanel state={s} onClose={() => { s.upgradeOpen = false; rerender(); }} />}
        {s.miniGame && (
          <MiniGame
            state={s}
            onClose={(success) => {
              if (s.miniGame?.kind === "bonus" && success) s.bonusActive = 30;
              s.miniGame = null;
              rerender();
            }}
          />
        )}
      </div>

      <TouchControls keysRef={keysRef} state={s} onUpgrade={() => { s.upgradeOpen = true; rerender(); }} />

      <footer className="pixel-font text-[8px] md:text-[9px] text-muted-foreground max-w-[900px] text-center leading-relaxed px-2">
        Walk to a vehicle and hold PUMP/SPACE to fuel up. Bigger tanks = bigger payday.
        Serve the gold-star VIPs first! Random tire & ×2 bonus rounds will pop up.
      </footer>
    </div>
  );
}

function update(s: GameState, keys: Keys, dt: number) {
  if (s.bonusActive > 0) s.bonusActive = Math.max(0, s.bonusActive - dt);
  if (s.miniGame || s.upgradeOpen) return;

  const baseSpeed = 110 + s.upgrades.walk * 28;
  const speed = baseSpeed * (s.bonusActive > 0 ? 2 : 1);
  let dx = 0, dy = 0;
  if (keys["w"] || keys["arrowup"]) dy -= 1;
  if (keys["s"] || keys["arrowdown"]) dy += 1;
  if (keys["a"] || keys["arrowleft"]) dx -= 1;
  if (keys["d"] || keys["arrowright"]) dx += 1;
  const moving = dx !== 0 || dy !== 0;
  if (moving) {
    const len = Math.hypot(dx, dy);
    s.player.x += (dx / len) * speed * dt;
    s.player.y += (dy / len) * speed * dt;
    s.player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    s.player.walkT += dt * 8;
  }
  s.player.x = Math.max(12, Math.min(MAP_W * TILE - 12, s.player.x));
  s.player.y = Math.max(12, Math.min(MAP_H * TILE - 12, s.player.y));

  const nearShop = Math.hypot(s.player.x - s.shop.x, s.player.y - s.shop.y) < 44;
  s.nearShop = nearShop;
  if (nearShop && keys["e"]) { s.upgradeOpen = true; keys["e"] = false; }

  s.spawnTimer -= dt;
  const activePumps = 2 + s.upgrades.pumps;
  if (s.spawnTimer <= 0 && s.vehicles.length < activePumps) {
    s.spawnTimer = 3 + Math.random() * 3;
    spawnVehicle(s, activePumps);
  }

  s.eventTimer -= dt;
  if (s.eventTimer <= 0 && !s.miniGame) {
    s.eventTimer = 25 + Math.random() * 25;
    if (Math.random() < 0.5) s.miniGame = { kind: "tire", t: 6, progress: 0, target: 18 };
    else s.miniGame = { kind: "bonus", t: 5, progress: 0, target: 14 };
  }

  for (const v of s.vehicles) {
    if (v.state === "arriving") {
      const a = Math.atan2(v.targetY - v.y, v.targetX - v.x);
      const d = Math.hypot(v.targetX - v.x, v.targetY - v.y);
      if (d < 1.5) { v.x = v.targetX; v.y = v.targetY; v.state = "waiting"; }
      else { v.x += Math.cos(a) * 60 * dt; v.y += Math.sin(a) * 60 * dt; }
    } else if (v.state === "waiting" || v.state === "pumping") {
      v.patience -= dt * (v.vip ? 1.4 : 1);
      if (v.patience <= 0) { v.state = "leaving"; v.targetX = MAP_W * TILE + 60; }
    } else if (v.state === "done" || v.state === "leaving") {
      v.x += 80 * dt;
      if (v.x > MAP_W * TILE + 50) v.dead = true;
    }
  }
  s.vehicles = s.vehicles.filter((v) => !v.dead);

  s.player.pumping = false;
  if (keys[" "]) {
    let best: Vehicle | null = null;
    let bestD = 30;
    for (const v of s.vehicles) {
      if (v.state !== "waiting" && v.state !== "pumping") continue;
      const d = Math.hypot(v.x - s.player.x, v.y - s.player.y);
      if (d < bestD) { bestD = d; best = v; }
    }
    if (best) {
      best.state = "pumping";
      s.player.pumping = true;
      const rate = (12 + s.upgrades.pumpSpeed * 8) * (s.bonusActive > 0 ? 2 : 1);
      const give = Math.min(rate * dt, best.tank - best.filled);
      best.filled += give;
      const mult = (s.bonusActive > 0 ? 2 : 1) * (1 + s.upgrades.coinMult * 0.5) * (best.vip ? 2 : 1);
      s.coins += give * 1.2 * mult;
      if (best.filled >= best.tank) { best.state = "done"; best.targetX = MAP_W * TILE + 60; s.served++; }
    }
  }
}

function spawnVehicle(s: GameState, activePumps: number) {
  const usable = PUMP_SPOTS.slice(0, activePumps);
  const free = usable.filter(slot => !s.vehicles.some(v => v.targetX === slot.x && v.targetY === slot.y && v.state !== "leaving" && v.state !== "done"));
  if (!free.length) return;
  const slot = free[Math.floor(Math.random() * free.length)];
  const vip = !s.lastWasVip && Math.random() < 0.18;
  s.lastWasVip = vip;
  const kinds: VehicleKind[] = ["car", "car", "van", "truck", "bus"];
  let kind: VehicleKind = kinds[Math.floor(Math.random() * kinds.length)];
  if (vip) kind = Math.random() < 0.5 ? "limo" : "truck";
  const tank =
    kind === "car" ? 30 + Math.random() * 20 :
    kind === "van" ? 55 + Math.random() * 20 :
    kind === "truck" ? 90 + Math.random() * 30 :
    kind === "bus" ? 110 + Math.random() * 30 : 140;
  s.vehicles.push({
    x: -40, y: slot.y, targetX: slot.x, targetY: slot.y,
    tank, filled: 0, state: "arriving",
    patience: vip ? 28 : 40 + Math.random() * 15,
    maxPatience: vip ? 28 : 55,
    vip, kind, color: pickColor(), dead: false,
  });
}

function pickColor() {
  const palette = ["#e94f4f", "#4f9be9", "#62c46a", "#f0b03e", "#b35bd6", "#39c9c9", "#e87aa5", "#d8d8d8"];
  return palette[Math.floor(Math.random() * palette.length)];
}
