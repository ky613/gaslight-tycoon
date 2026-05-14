// Per-level config: humble bote-bote → mega highway empire
export interface LevelTheme {
  sky: string;
  grass: string;
  pad: string;
  canopy: string;
  canopyTrim: string;
  shopWall: string;
  shopRoof: string;
  signTitle: string;
  era: "bote-bote" | "barangay" | "townstation" | "highway" | "mega";
}

export interface LevelUpgradeDef {
  key: "pumpSpeed" | "walk" | "pumps" | "coinMult";
  name: string;
  desc: string;
  cost: number;
}

export interface LevelConfig {
  level: number;
  title: string;
  story: string;
  coinTarget: number;
  vipNeeded: number;
  maxRageQuits: number;
  spawnIntervalMin: number;
  spawnIntervalMax: number;
  maxConcurrent: number;
  patienceMult: number; // lower = harder (less patience)
  basePatience: number;
  rageQuitPenalty: number;
  theme: LevelTheme;
  upgrade: LevelUpgradeDef;
}

const T: Record<LevelTheme["era"], LevelTheme> = {
  "bote-bote": {
    sky: "#3a2a1a", grass: "#7a8a3a", pad: "#a08858", canopy: "#8a5a2a",
    canopyTrim: "#5a3818", shopWall: "#c9a86a", shopRoof: "#5a3818",
    signTitle: "BOTE-BOTE", era: "bote-bote",
  },
  "barangay": {
    sky: "#1a2a4a", grass: "#7cc04a", pad: "#cfcfcf", canopy: "#ED1C24",
    canopyTrim: "#660011", shopWall: "#e6dcc0", shopRoof: "#660011",
    signTitle: "BRGY GAS", era: "barangay",
  },
  "townstation": {
    sky: "#0e2540", grass: "#5fa036", pad: "#d8d8d8", canopy: "#1D55A4",
    canopyTrim: "#002147", shopWall: "#f0e8d4", shopRoof: "#4B7D1D",
    signTitle: "TOWN STATION", era: "townstation",
  },
  "highway": {
    sky: "#0a1830", grass: "#3a8a3a", pad: "#b8b8b8", canopy: "#0d2a5a",
    canopyTrim: "#F9B91B", shopWall: "#d8d8d8", shopRoof: "#1a1a1a",
    signTitle: "HI-WAY STOP", era: "highway",
  },
  "mega": {
    sky: "#070418", grass: "#1a3a4a", pad: "#2a2a35", canopy: "#0a0a18",
    canopyTrim: "#ff2bd6", shopWall: "#1a1a2a", shopRoof: "#0d0d1a",
    signTitle: "MEGA NEON", era: "mega",
  },
};

export const LEVELS: LevelConfig[] = [
  { level: 1, title: "Bote-Bote sa Kanto", story: "Roadside lang muna. Punuin ang bote.", coinTarget: 80, vipNeeded: 0, maxRageQuits: 3, spawnIntervalMin: 4, spawnIntervalMax: 6, maxConcurrent: 1, patienceMult: 1.2, basePatience: 50, rageQuitPenalty: 10, theme: T["bote-bote"], upgrade: { key: "pumpSpeed", name: "Mas Bilis Buhos", desc: "+8 fuel/sec", cost: 40 } },
  { level: 2, title: "Karagdagang Bote", story: "Marami nang papuntang BBQ stand.", coinTarget: 160, vipNeeded: 0, maxRageQuits: 3, spawnIntervalMin: 3.5, spawnIntervalMax: 5.5, maxConcurrent: 2, patienceMult: 1.1, basePatience: 48, rageQuitPenalty: 15, theme: T["bote-bote"], upgrade: { key: "walk", name: "Tsinelas Pro", desc: "Tumakbo nang mabilis", cost: 80 } },
  { level: 3, title: "Barangay Station", story: "May tunay na pump na! Welcome sa brgy.", coinTarget: 280, vipNeeded: 1, maxRageQuits: 3, spawnIntervalMin: 3, spawnIntervalMax: 5, maxConcurrent: 2, patienceMult: 1, basePatience: 45, rageQuitPenalty: 20, theme: T["barangay"], upgrade: { key: "pumpSpeed", name: "Pump Upgrade", desc: "+8 fuel/sec", cost: 120 } },
  { level: 4, title: "Rush Hour Probinsya", story: "Konsehal pumipila — wag mo papagalitin!", coinTarget: 420, vipNeeded: 2, maxRageQuits: 2, spawnIntervalMin: 2.8, spawnIntervalMax: 4.5, maxConcurrent: 2, patienceMult: 0.95, basePatience: 42, rageQuitPenalty: 25, theme: T["barangay"], upgrade: { key: "pumps", name: "Dagdag Lane", desc: "+1 lane", cost: 200 } },
  { level: 5, title: "Town Station", story: "Bagong pintura, bagong customers.", coinTarget: 600, vipNeeded: 2, maxRageQuits: 2, spawnIntervalMin: 2.5, spawnIntervalMax: 4, maxConcurrent: 3, patienceMult: 0.9, basePatience: 40, rageQuitPenalty: 30, theme: T["townstation"], upgrade: { key: "coinMult", name: "Logo Deal", desc: "+50% coins", cost: 260 } },
  { level: 6, title: "Tour Bus Madness", story: "Dalawang tour bus papasok. Game ka ba?", coinTarget: 850, vipNeeded: 3, maxRageQuits: 2, spawnIntervalMin: 2.3, spawnIntervalMax: 3.8, maxConcurrent: 3, patienceMult: 0.85, basePatience: 38, rageQuitPenalty: 40, theme: T["townstation"], upgrade: { key: "pumpSpeed", name: "Hi-Flow Nozzle", desc: "+8 fuel/sec", cost: 320 } },
  { level: 7, title: "Hi-Way Stop", story: "Highway na — trucks at limos pumipila.", coinTarget: 1200, vipNeeded: 3, maxRageQuits: 2, spawnIntervalMin: 2.0, spawnIntervalMax: 3.5, maxConcurrent: 3, patienceMult: 0.8, basePatience: 36, rageQuitPenalty: 50, theme: T["highway"], upgrade: { key: "pumps", name: "Dagdag Lane", desc: "+1 lane", cost: 400 } },
  { level: 8, title: "VIP Convoy", story: "Maraming malalaking tank — uunahin mo sila.", coinTarget: 1700, vipNeeded: 4, maxRageQuits: 1, spawnIntervalMin: 1.8, spawnIntervalMax: 3.2, maxConcurrent: 4, patienceMult: 0.75, basePatience: 34, rageQuitPenalty: 60, theme: T["highway"], upgrade: { key: "walk", name: "Boots ng Bayani", desc: "Sobrang bilis", cost: 480 } },
  { level: 9, title: "Mega Empire", story: "Neon na ang station mo. Wag pumalpak!", coinTarget: 2400, vipNeeded: 5, maxRageQuits: 1, spawnIntervalMin: 1.6, spawnIntervalMax: 3.0, maxConcurrent: 4, patienceMult: 0.7, basePatience: 32, rageQuitPenalty: 80, theme: T["mega"], upgrade: { key: "coinMult", name: "Mega Branding", desc: "+50% coins", cost: 600 } },
  { level: 10, title: "Final: Gas Tycoon", story: "Final boss night — galingan mo, BOSS!", coinTarget: 3500, vipNeeded: 6, maxRageQuits: 1, spawnIntervalMin: 1.4, spawnIntervalMax: 2.6, maxConcurrent: 4, patienceMult: 0.6, basePatience: 30, rageQuitPenalty: 100, theme: T["mega"], upgrade: { key: "pumpSpeed", name: "Tycoon Nozzle", desc: "+8 fuel/sec", cost: 800 } },
];

export function levelOf(n: number) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, n - 1))];
}
