export const TILE = 16;
export const MAP_W = 70; // tiles
export const MAP_H = 32;

// pump spots where vehicles park (in pixels)
export const PUMP_SPOTS = [
  { x: 28 * TILE, y: 14 * TILE },
  { x: 36 * TILE, y: 14 * TILE },
  { x: 44 * TILE, y: 14 * TILE },
  { x: 28 * TILE, y: 22 * TILE },
  { x: 36 * TILE, y: 22 * TILE },
  { x: 44 * TILE, y: 22 * TILE },
];

// pump posts placed just above each car spot
export const PUMPS = PUMP_SPOTS.map((s) => ({ x: s.x, y: s.y - 22 }));

export const SHOP = { x: 10 * TILE, y: 10 * TILE };
