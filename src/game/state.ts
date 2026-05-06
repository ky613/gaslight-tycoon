import { SHOP, TILE, MAP_H, MAP_W } from "./world";

export type VehicleKind = "car" | "van" | "truck" | "bus" | "limo";

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
}

export interface Player {
  x: number;
  y: number;
  facing: "up" | "down" | "left" | "right";
  walkT: number;
  pumping: boolean;
}

export interface Upgrades {
  pumpSpeed: number; // increases fuel/sec
  walk: number;     // walk speed
  pumps: number;    // max simultaneous cars
  coinMult: number; // coin multiplier
}

export interface MiniGameState {
  kind: "tire" | "bonus";
  t: number;        // time remaining
  progress: number; // presses
  target: number;   // presses needed
}

export interface GameState {
  player: Player;
  vehicles: Vehicle[];
  cam: { x: number; y: number };
  coins: number;
  served: number;
  shop: { x: number; y: number };
  upgrades: Upgrades;
  spawnTimer: number;
  eventTimer: number;
  upgradeOpen: boolean;
  nearShop: boolean;
  miniGame: MiniGameState | null;
  bonusActive: number; // seconds remaining of x2
  lastWasVip: boolean;
}

export function createInitialState(): GameState {
  return {
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

export const MAP_PIXELS = { w: MAP_W * TILE, h: MAP_H * TILE };
