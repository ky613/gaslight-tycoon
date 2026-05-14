import { SHOP, TILE, MAP_H, MAP_W } from "./world";
import { LEVELS, levelOf, LevelConfig } from "./levels";

export type VehicleKind = "car" | "van" | "truck" | "bus" | "limo";
export type Character = "boy" | "girl";
export type Phase = "character" | "intro" | "playing" | "result";

export interface Vehicle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  tank: number;
  filled: number;
  state: "arriving" | "waiting" | "pumping" | "done" | "leaving";
  patience: number;
  maxPatience: number;
  vip: boolean;
  kind: VehicleKind;
  color: string;
  dead: boolean;
  rageQuit?: boolean; // marked when leaving angry
}

export interface Player {
  x: number;
  y: number;
  facing: "up" | "down" | "left" | "right";
  walkT: number;
  pumping: boolean;
}

export interface Upgrades {
  pumpSpeed: number;
  walk: number;
  pumps: number;
  coinMult: number;
}

export interface MiniGameState {
  kind: "tire" | "bonus";
  t: number;
  progress: number;
  target: number;
}

export interface LevelStats {
  coins: number;
  vipsServed: number;
  rageQuits: number;
  elapsed: number;
}

export interface GameState {
  phase: Phase;
  character: Character;
  level: number; // 1..10
  levelConfig: LevelConfig;
  levelStats: LevelStats;
  levelResult: "win" | "lose" | null;

  player: Player;
  vehicles: Vehicle[];
  cam: { x: number; y: number };
  coins: number; // resets per level
  served: number;
  shop: { x: number; y: number };
  upgrades: Upgrades;
  spawnTimer: number;
  eventTimer: number;
  upgradeOpen: boolean;
  nearShop: boolean;
  miniGame: MiniGameState | null;
  bonusActive: number;
  lastWasVip: boolean;
}

export function createInitialState(): GameState {
  const cfg = levelOf(1);
  return {
    phase: "character",
    character: "boy",
    level: 1,
    levelConfig: cfg,
    levelStats: { coins: 0, vipsServed: 0, rageQuits: 0, elapsed: 0 },
    levelResult: null,
    player: { x: 32 * TILE, y: 18 * TILE, facing: "down", walkT: 0, pumping: false },
    vehicles: [],
    cam: { x: 0, y: 0 },
    coins: 0,
    served: 0,
    shop: SHOP,
    upgrades: { pumpSpeed: 0, walk: 0, pumps: 0, coinMult: 0 },
    spawnTimer: 1.5,
    eventTimer: 18 + Math.random() * 10,
    upgradeOpen: false,
    nearShop: false,
    miniGame: null,
    bonusActive: 0,
    lastWasVip: false,
  };
}

export function startLevel(s: GameState, n: number) {
  const cfg = levelOf(n);
  s.level = n;
  s.levelConfig = cfg;
  s.levelStats = { coins: 0, vipsServed: 0, rageQuits: 0, elapsed: 0 };
  s.levelResult = null;
  s.vehicles = [];
  s.coins = 0;
  s.served = 0;
  s.upgrades = { pumpSpeed: 0, walk: 0, pumps: 0, coinMult: 0 };
  s.spawnTimer = 1.2;
  s.eventTimer = 20 + Math.random() * 10;
  s.bonusActive = 0;
  s.miniGame = null;
  s.upgradeOpen = false;
  s.player.x = 32 * TILE;
  s.player.y = 18 * TILE;
  s.phase = "playing";
}

export const TOTAL_LEVELS = LEVELS.length;
export const MAP_PIXELS = { w: MAP_W * TILE, h: MAP_H * TILE };
