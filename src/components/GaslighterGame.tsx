import { useEffect, useRef, useState } from "react";
import { drawScene, drawSprites, pickPriorityVehicle } from "@/game/render";
import { createInitialState, GameState, startLevel, TOTAL_LEVELS, Vehicle, VehicleKind } from "@/game/state";
import { TILE, MAP_W, MAP_H, PUMP_SPOTS } from "@/game/world";
import UpgradePanel from "@/components/UpgradePanel";
import HUD from "@/components/HUD";
import MiniGame from "@/components/MiniGame";
import TouchControls from "@/components/TouchControls";
import CharacterSelect from "@/components/CharacterSelect";
import LevelIntro from "@/components/LevelIntro";
import LevelResult from "@/components/LevelResult";

type Keys = Record<string, boolean>;

export default function GaslighterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const keysRef = useRef<Keys>({});
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  useEffect(() => {
    const id = setInterval(rerender, 120);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current, w = wrapRef.current;
      if (!c || !w) return;
      const rect = w.getBoundingClientRect();
      const targetTile = 28;
      const cw = Math.max(320, Math.floor(rect.width));
      const ch = Math.max(240, Math.floor(rect.height));
      const scale = Math.max(1, Math.round((cw / (MAP_W * TILE)) * (targetTile / TILE)));
      const internalW = Math.max(380, Math.floor(cw / scale));
      const internalH = Math.max(260, Math.floor(ch / scale));
      c.width = internalW;
      c.height = internalH;
      c.style.width = cw + "px";
      c.style.height = ch + "px";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
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
      ctx.imageSmoothingEnabled = false;
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
      if (["arrowup","arrowdown","arrowleft","arrowright"].includes(k) || e.key === " ") e.preventDefault();
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const s = stateRef.current;
  const playing = s.phase === "playing";

  return (
    <div className="fixed inset-0 bg-background text-foreground flex flex-col select-none overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1 gap-2 border-b-2 border-border bg-card/60 backdrop-blur">
        <h1 className="pixel-font text-primary text-shadow-pixel text-[10px] sm:text-base whitespace-nowrap">
          ⛽ GASLIGHTER
        </h1>
        {playing && <HUD state={s} />}
      </div>

      <div ref={wrapRef} className="relative flex-1 min-h-0 bg-[#0e1626]">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          onClick={(e) => (e.currentTarget as HTMLCanvasElement).focus()}
          className="block outline-none mx-auto"
          style={{ imageRendering: "pixelated" }}
        />

        {playing && (
          <TouchControls keysRef={keysRef} state={s} onOpenUpgrade={() => { s.upgradeOpen = true; rerender(); }} />
        )}

        {s.bonusActive > 0 && playing && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 panel px-3 py-1 pixel-font text-[10px] text-primary text-shadow-pixel">
            x2 BONUS · {s.bonusActive.toFixed(1)}s
          </div>
        )}

        {s.phase === "character" && (
          <CharacterSelect
            state={s}
            onPick={(c) => { s.character = c; startLevel(s, 1); s.phase = "intro"; rerender(); }}
          />
        )}
        {s.phase === "intro" && (
          <LevelIntro state={s} onStart={() => { s.phase = "playing"; rerender(); }} />
        )}
        {s.phase === "result" && (
          <LevelResult
            state={s}
            onNext={() => { startLevel(s, s.level + 1); s.phase = "intro"; rerender(); }}
            onRetry={() => { startLevel(s, s.levelResult === "win" ? 1 : s.level); s.phase = "intro"; rerender(); }}
          />
        )}

        {playing && s.upgradeOpen && <UpgradePanel state={s} onClose={() => { s.upgradeOpen = false; rerender(); }} />}
        {playing && s.miniGame && (
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
    </div>
  );
}

function update(s: GameState, keys: Keys, dt: number) {
  if (s.phase !== "playing") return;
  if (s.bonusActive > 0) s.bonusActive = Math.max(0, s.bonusActive - dt);
  if (s.miniGame || s.upgradeOpen) return;

  s.levelStats.elapsed += dt;
  const cfg = s.levelConfig;

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
  const activePumps = Math.min(cfg.maxConcurrent, 2 + s.upgrades.pumps);
  if (s.spawnTimer <= 0 && s.vehicles.length < activePumps) {
    s.spawnTimer = cfg.spawnIntervalMin + Math.random() * (cfg.spawnIntervalMax - cfg.spawnIntervalMin);
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
      if (v.patience <= 0) {
        v.state = "leaving";
        v.targetX = MAP_W * TILE + 60;
        v.rageQuit = true;
        s.levelStats.rageQuits++;
        // penalty
        s.coins = Math.max(0, s.coins - cfg.rageQuitPenalty);
      }
    } else if (v.state === "done" || v.state === "leaving") {
      v.x += 80 * dt;
      if (v.x > MAP_W * TILE + 50) v.dead = true;
    }
  }
  s.vehicles = s.vehicles.filter((v) => !v.dead);

  s.player.pumping = false;
  if (keys[" "]) {
    // Priority: VIP > biggest tank > nearest
    const candidates = s.vehicles.filter(v => (v.state === "waiting" || v.state === "pumping") && Math.hypot(v.x - s.player.x, v.y - s.player.y) < 30);
    candidates.sort((a, b) => {
      if (a.vip !== b.vip) return a.vip ? -1 : 1;
      if (Math.abs(a.tank - b.tank) > 5) return b.tank - a.tank;
      return Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y);
    });
    const best = candidates[0] ?? null;
    if (best) {
      best.state = "pumping";
      s.player.pumping = true;
      const rate = (12 + s.upgrades.pumpSpeed * 8) * (s.bonusActive > 0 ? 2 : 1);
      const give = Math.min(rate * dt, best.tank - best.filled);
      best.filled += give;
      const mult = (s.bonusActive > 0 ? 2 : 1) * (1 + s.upgrades.coinMult * 0.5) * (best.vip ? 2 : 1);
      const earned = give * 1.2 * mult;
      s.coins += earned;
      s.levelStats.coins += earned;
      if (best.filled >= best.tank) {
        best.state = "done";
        best.targetX = MAP_W * TILE + 60;
        s.served++;
        if (best.vip) s.levelStats.vipsServed++;
      }
    }
  }

  // touch priority indicator (used for visual)
  pickPriorityVehicle(s.vehicles);

  // check level end conditions
  if (s.levelStats.rageQuits > cfg.maxRageQuits) {
    s.levelResult = "lose";
    s.phase = "result";
  } else if (s.levelStats.coins >= cfg.coinTarget && s.levelStats.vipsServed >= cfg.vipNeeded) {
    s.levelResult = "win";
    s.phase = "result";
  }
}

function spawnVehicle(s: GameState, activePumps: number) {
  const cfg = s.levelConfig;
  const usable = PUMP_SPOTS.slice(0, activePumps);
  const free = usable.filter(slot => !s.vehicles.some(v => v.targetX === slot.x && v.targetY === slot.y && v.state !== "leaving" && v.state !== "done"));
  if (!free.length) return;
  const slot = free[Math.floor(Math.random() * free.length)];
  // VIP rate scales with level need
  const vipChance = Math.min(0.45, 0.12 + cfg.vipNeeded * 0.04);
  const vip = !s.lastWasVip && Math.random() < vipChance;
  s.lastWasVip = vip;
  // larger vehicles more common in higher levels
  const lv = cfg.level;
  const kinds: VehicleKind[] = lv <= 2
    ? ["car", "car", "car", "van"]
    : lv <= 5
    ? ["car", "car", "van", "van", "truck"]
    : lv <= 8
    ? ["car", "van", "truck", "truck", "bus"]
    : ["van", "truck", "truck", "bus", "bus", "limo"];
  let kind: VehicleKind = kinds[Math.floor(Math.random() * kinds.length)];
  if (vip) kind = Math.random() < 0.5 ? "limo" : "truck";
  const tank =
    kind === "car" ? 30 + Math.random() * 20 :
    kind === "van" ? 55 + Math.random() * 20 :
    kind === "truck" ? 90 + Math.random() * 30 :
    kind === "bus" ? 110 + Math.random() * 30 : 140;
  const basePat = cfg.basePatience * cfg.patienceMult;
  s.vehicles.push({
    x: -40, y: slot.y, targetX: slot.x, targetY: slot.y,
    tank, filled: 0, state: "arriving",
    patience: vip ? basePat * 0.7 : basePat,
    maxPatience: vip ? basePat * 0.7 : basePat,
    vip, kind, color: pickColor(), dead: false,
  });
}

function pickColor() {
  const palette = ["#e94f4f", "#4f9be9", "#62c46a", "#f0b03e", "#b35bd6", "#39c9c9", "#e87aa5", "#d8d8d8"];
  return palette[Math.floor(Math.random() * palette.length)];
}
