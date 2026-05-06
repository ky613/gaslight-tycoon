import { GameState, Vehicle } from "./state";
import { MAP_H, MAP_W, PUMPS, PUMP_SPOTS, SHOP, TILE } from "./world";

export function drawScene(ctx: CanvasRenderingContext2D, s: GameState, vw: number, vh: number) {
  // sky/ground background
  ctx.fillStyle = "#1a2436";
  ctx.fillRect(0, 0, vw, vh);

  ctx.save();
  ctx.translate(-Math.floor(s.cam.x), -Math.floor(s.cam.y));

  // grass border
  drawGrass(ctx);

  // road through middle (horizontal) for cars to enter from left to right
  drawRoad(ctx, 13 * TILE, 4 * TILE);
  drawRoad(ctx, 21 * TILE, 4 * TILE);

  // gas station big concrete pad
  drawConcrete(ctx, 22 * TILE, 8 * TILE, 30 * TILE, 18 * TILE);

  // station building (the "Gaslighter" shop with awning) on the left under shop position
  drawShop(ctx);

  // big canopy over pumps
  drawCanopy(ctx, 23 * TILE, 9 * TILE, 28 * TILE, 4 * TILE);
  drawCanopy(ctx, 23 * TILE, 17 * TILE, 28 * TILE, 4 * TILE);

  // pumps (only show unlocked; locked are faded with padlock)
  const activePumps = 2 + s.upgrades.pumps;
  for (let i = 0; i < PUMPS.length; i++) {
    const p = PUMPS[i];
    if (i < activePumps) drawPump(ctx, p.x, p.y);
    else drawLockedPump(ctx, p.x, p.y);
  }

  // parking lines (only for unlocked)
  ctx.strokeStyle = "#f8e6a0";
  ctx.lineWidth = 1;
  for (let i = 0; i < activePumps; i++) {
    const sp = PUMP_SPOTS[i];
    ctx.strokeRect(sp.x - 14, sp.y - 8, 28, 16);
  }

  // decorative trees / cones
  drawTree(ctx, 4 * TILE, 5 * TILE);
  drawTree(ctx, 6 * TILE, 26 * TILE);
  drawTree(ctx, 56 * TILE, 4 * TILE);
  drawTree(ctx, 60 * TILE, 27 * TILE);
  drawCone(ctx, 22 * TILE, 26 * TILE);
  drawCone(ctx, 52 * TILE, 26 * TILE);

  // shop sign
  drawSign(ctx, SHOP.x - 8, SHOP.y - 50);

  ctx.restore();
}

export function drawSprites(ctx: CanvasRenderingContext2D, s: GameState) {
  ctx.save();
  ctx.translate(-Math.floor(s.cam.x), -Math.floor(s.cam.y));

  // sort by Y for fake depth
  const all: { y: number; draw: () => void }[] = [];
  for (const v of s.vehicles) all.push({ y: v.y, draw: () => drawVehicle(ctx, v) });
  all.push({ y: s.player.y, draw: () => drawPlayer(ctx, s) });
  all.sort((a, b) => a.y - b.y);
  for (const a of all) a.draw();

  // bars above vehicles
  for (const v of s.vehicles) drawVehicleBars(ctx, v);

  // shop prompt
  if (s.nearShop) {
    drawPrompt(ctx, SHOP.x, SHOP.y - 36, "PRESS E");
  }

  ctx.restore();

  // bonus banner
  if (s.bonusActive > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, ctx.canvas.width, 22);
    ctx.fillStyle = "#ffd84a";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`x2 BONUS! ${s.bonusActive.toFixed(1)}s`, ctx.canvas.width / 2, 15);
    ctx.restore();
  }
}

// ---------- helpers ----------

function drawGrass(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#2f6b3a";
  ctx.fillRect(0, 0, MAP_W * TILE, MAP_H * TILE);
  // checker pattern
  ctx.fillStyle = "#286232";
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
  // little grass tufts
  ctx.fillStyle = "#3c8049";
  for (let i = 0; i < 60; i++) {
    const x = (i * 137) % (MAP_W * TILE);
    const y = (i * 71) % (MAP_H * TILE);
    if (x > 22 * TILE && x < 52 * TILE && y > 7 * TILE && y < 26 * TILE) continue;
    ctx.fillRect(x, y, 2, 2);
    ctx.fillRect(x + 3, y + 1, 2, 2);
  }
}

function drawRoad(ctx: CanvasRenderingContext2D, y: number, h: number) {
  ctx.fillStyle = "#2a2d34";
  ctx.fillRect(0, y, MAP_W * TILE, h);
  // shoulder
  ctx.fillStyle = "#3a3e48";
  ctx.fillRect(0, y, MAP_W * TILE, 2);
  ctx.fillRect(0, y + h - 2, MAP_W * TILE, 2);
  // dashes
  ctx.fillStyle = "#f0d36a";
  for (let x = 0; x < MAP_W * TILE; x += 24) {
    ctx.fillRect(x, y + h / 2 - 1, 12, 2);
  }
}

function drawConcrete(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#7d8290";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#888d9b";
  for (let i = 0; i < w; i += 32) {
    ctx.fillRect(x + i, y, 1, h);
  }
  for (let i = 0; i < h; i += 32) {
    ctx.fillRect(x, y + i, w, 1);
  }
  // edge
  ctx.fillStyle = "#4a4e58";
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
}

function drawCanopy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x + 2, y + h, w, 4);
  // roof
  ctx.fillStyle = "#c43a3a";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#e85050";
  ctx.fillRect(x, y, w, 2);
  // stripe
  ctx.fillStyle = "#fff3c0";
  ctx.fillRect(x, y + h - 4, w, 2);
  // support pillars
  ctx.fillStyle = "#d0d4dc";
  ctx.fillRect(x + 2, y + h, 4, 8);
  ctx.fillRect(x + w - 6, y + h, 4, 8);
}

function drawShop(ctx: CanvasRenderingContext2D) {
  const x = SHOP.x - 28, y = SHOP.y - 28, w = 56, h = 50;
  // back wall
  ctx.fillStyle = "#dcd3b8";
  ctx.fillRect(x, y, w, h);
  // roof
  ctx.fillStyle = "#a23838";
  ctx.fillRect(x - 2, y - 6, w + 4, 8);
  ctx.fillStyle = "#c44545";
  ctx.fillRect(x - 2, y - 6, w + 4, 2);
  // door
  ctx.fillStyle = "#5b3a22";
  ctx.fillRect(x + w / 2 - 6, y + h - 18, 12, 18);
  ctx.fillStyle = "#f0d36a";
  ctx.fillRect(x + w / 2 + 3, y + h - 9, 1, 2);
  // window
  ctx.fillStyle = "#7ec8e3";
  ctx.fillRect(x + 6, y + 8, 14, 12);
  ctx.fillRect(x + w - 20, y + 8, 14, 12);
  ctx.fillStyle = "#a8e0f5";
  ctx.fillRect(x + 6, y + 8, 14, 3);
  ctx.fillRect(x + w - 20, y + 8, 14, 3);
  // frame
  ctx.strokeStyle = "#3a2a18";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 6, y + 8, 14, 12);
  ctx.strokeRect(x + w - 20, y + 8, 14, 12);
}

function drawSign(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // pole
  ctx.fillStyle = "#9aa0ad";
  ctx.fillRect(x + 13, y + 14, 2, 30);
  // sign box
  ctx.fillStyle = "#1a2436";
  ctx.fillRect(x - 8, y, 44, 16);
  ctx.fillStyle = "#ffd84a";
  ctx.fillRect(x - 6, y + 2, 40, 12);
  ctx.fillStyle = "#1a2436";
  ctx.font = "6px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText("UPGRADE", x + 14, y + 10);
}

function drawPump(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // base
  ctx.fillStyle = "#2a2d34";
  ctx.fillRect(x - 8, y + 14, 16, 4);
  // body (red)
  ctx.fillStyle = "#c93232";
  ctx.fillRect(x - 7, y - 4, 14, 18);
  // top highlight
  ctx.fillStyle = "#e85050";
  ctx.fillRect(x - 7, y - 4, 14, 2);
  // screen
  ctx.fillStyle = "#1a2436";
  ctx.fillRect(x - 5, y - 1, 10, 5);
  ctx.fillStyle = "#62c46a";
  ctx.fillRect(x - 4, y, 2, 1);
  ctx.fillRect(x - 1, y, 2, 1);
  ctx.fillRect(x + 2, y, 2, 1);
  // logo stripe
  ctx.fillStyle = "#ffd84a";
  ctx.fillRect(x - 7, y + 7, 14, 2);
  // hose
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 7, y + 6);
  ctx.quadraticCurveTo(x + 14, y + 12, x + 11, y + 18);
  ctx.stroke();
  // nozzle
  ctx.fillStyle = "#2a2d34";
  ctx.fillRect(x + 9, y + 17, 5, 3);
  ctx.fillStyle = "#888d9b";
  ctx.fillRect(x + 12, y + 18, 2, 1);
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#5b3a22";
  ctx.fillRect(x - 1, y + 8, 3, 6);
  ctx.fillStyle = "#1f5a2a";
  ctx.fillRect(x - 6, y, 13, 10);
  ctx.fillRect(x - 4, y - 4, 9, 6);
  ctx.fillStyle = "#2c7a3a";
  ctx.fillRect(x - 5, y, 11, 2);
  ctx.fillRect(x - 3, y - 4, 7, 2);
}

function drawCone(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - 4, y + 6, 8, 2);
  ctx.fillStyle = "#ee6a2a";
  ctx.beginPath();
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x - 3, y + 6);
  ctx.lineTo(x + 3, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff3c0";
  ctx.fillRect(x - 2, y + 1, 4, 1);
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: GameState) {
  const p = s.player;
  const x = Math.floor(p.x);
  const y = Math.floor(p.y);
  const bob = Math.floor(Math.sin(p.walkT) * 1);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x - 5, y + 8, 10, 2);

  // legs
  ctx.fillStyle = "#1f3a6e";
  ctx.fillRect(x - 4, y + 4 + bob, 3, 5);
  ctx.fillRect(x + 1, y + 4 - bob, 3, 5);

  // body (uniform red)
  ctx.fillStyle = "#c93232";
  ctx.fillRect(x - 5, y - 3, 10, 8);
  // belt
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - 5, y + 3, 10, 1);
  // chest stripe
  ctx.fillStyle = "#ffd84a";
  ctx.fillRect(x - 5, y, 10, 1);

  // head
  ctx.fillStyle = "#f0c896";
  ctx.fillRect(x - 4, y - 9, 8, 6);
  // hat
  ctx.fillStyle = "#1a2436";
  ctx.fillRect(x - 5, y - 11, 10, 3);
  ctx.fillStyle = "#ffd84a";
  ctx.fillRect(x - 1, y - 10, 3, 1);

  // eyes (face direction)
  ctx.fillStyle = "#1a2436";
  if (p.facing === "down") {
    ctx.fillRect(x - 2, y - 6, 1, 1);
    ctx.fillRect(x + 1, y - 6, 1, 1);
  } else if (p.facing === "up") {
    // back of head, no eyes
  } else if (p.facing === "left") {
    ctx.fillRect(x - 3, y - 6, 1, 1);
  } else {
    ctx.fillRect(x + 2, y - 6, 1, 1);
  }

  // pump nozzle in hand if pumping
  if (p.pumping) {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x + 4, y, 4, 2);
    ctx.fillStyle = "#888d9b";
    ctx.fillRect(x + 7, y + 1, 2, 1);
  }
}

function drawVehicle(ctx: CanvasRenderingContext2D, v: Vehicle) {
  const x = Math.floor(v.x);
  const y = Math.floor(v.y);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x - 16, y + 8, 32, 3);

  if (v.kind === "car") drawCar(ctx, x, y, v.color);
  else if (v.kind === "van") drawVan(ctx, x, y, v.color);
  else if (v.kind === "truck") drawTruck(ctx, x, y, v.color);
  else if (v.kind === "bus") drawBus(ctx, x, y, v.color);
  else drawLimo(ctx, x, y, v.color);

  if (v.vip) {
    // gold star
    ctx.fillStyle = "#ffd84a";
    ctx.fillRect(x - 1, y - 18, 2, 6);
    ctx.fillRect(x - 3, y - 16, 6, 2);
    ctx.fillStyle = "#fff3c0";
    ctx.fillRect(x, y - 17, 1, 1);
  }
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  // body
  ctx.fillStyle = color;
  ctx.fillRect(x - 14, y - 2, 28, 8);
  // cabin
  ctx.fillRect(x - 9, y - 7, 18, 6);
  ctx.fillStyle = shade(color, -25);
  ctx.fillRect(x - 14, y + 4, 28, 2);
  // windows
  ctx.fillStyle = "#a8e0f5";
  ctx.fillRect(x - 8, y - 6, 7, 4);
  ctx.fillRect(x + 1, y - 6, 7, 4);
  ctx.fillStyle = shade(color, 20);
  ctx.fillRect(x - 14, y - 2, 28, 1);
  // wheels
  drawWheel(ctx, x - 9, y + 6);
  drawWheel(ctx, x + 9, y + 6);
  // headlights
  ctx.fillStyle = "#fff3c0";
  ctx.fillRect(x + 13, y, 2, 2);
  ctx.fillStyle = "#c93232";
  ctx.fillRect(x - 14, y, 1, 2);
}

function drawVan(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 16, y - 4, 32, 10);
  ctx.fillRect(x - 16, y - 9, 24, 6);
  ctx.fillStyle = shade(color, -25);
  ctx.fillRect(x - 16, y + 4, 32, 2);
  ctx.fillStyle = "#a8e0f5";
  ctx.fillRect(x - 15, y - 8, 8, 4);
  ctx.fillRect(x - 6, y - 8, 8, 4);
  drawWheel(ctx, x - 11, y + 6);
  drawWheel(ctx, x + 11, y + 6);
  ctx.fillStyle = "#fff3c0";
  ctx.fillRect(x + 14, y, 2, 2);
}

function drawTruck(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  // trailer
  ctx.fillStyle = "#d0d4dc";
  ctx.fillRect(x - 18, y - 8, 22, 14);
  ctx.fillStyle = "#9aa0ad";
  ctx.fillRect(x - 18, y + 4, 22, 2);
  ctx.fillStyle = "#5b6170";
  ctx.fillRect(x - 17, y - 7, 20, 2);
  // cab
  ctx.fillStyle = color;
  ctx.fillRect(x + 4, y - 5, 14, 11);
  ctx.fillStyle = "#a8e0f5";
  ctx.fillRect(x + 9, y - 4, 8, 5);
  drawWheel(ctx, x - 13, y + 6);
  drawWheel(ctx, x - 5, y + 6);
  drawWheel(ctx, x + 11, y + 6);
}

function drawBus(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 18, y - 9, 36, 15);
  ctx.fillStyle = shade(color, -25);
  ctx.fillRect(x - 18, y + 4, 36, 2);
  // windows row
  ctx.fillStyle = "#a8e0f5";
  for (let i = 0; i < 5; i++) ctx.fillRect(x - 16 + i * 7, y - 7, 5, 5);
  // door
  ctx.fillStyle = "#1a2436";
  ctx.fillRect(x + 14, y - 4, 4, 9);
  drawWheel(ctx, x - 12, y + 6);
  drawWheel(ctx, x + 12, y + 6);
}

function drawLimo(ctx: CanvasRenderingContext2D, x: number, y: number, _color: string) {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - 20, y - 3, 40, 9);
  ctx.fillRect(x - 14, y - 8, 26, 6);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(x - 20, y + 4, 40, 2);
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(x - 20, y - 3, 40, 1);
  // tinted windows
  ctx.fillStyle = "#3a4a5a";
  ctx.fillRect(x - 13, y - 7, 8, 4);
  ctx.fillRect(x - 4, y - 7, 6, 4);
  ctx.fillRect(x + 3, y - 7, 8, 4);
  // gold trim
  ctx.fillStyle = "#ffd84a";
  ctx.fillRect(x - 20, y + 2, 40, 1);
  drawWheel(ctx, x - 14, y + 6);
  drawWheel(ctx, x + 14, y + 6);
}

function drawWheel(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - 3, y - 2, 6, 4);
  ctx.fillStyle = "#5b6170";
  ctx.fillRect(x - 1, y - 1, 2, 2);
}

function shade(hex: string, amt: number) {
  const c = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(c.substring(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(c.substring(2, 4), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(c.substring(4, 6), 16) + amt));
  return `rgb(${r},${g},${b})`;
}

function drawVehicleBars(ctx: CanvasRenderingContext2D, v: Vehicle) {
  if (v.state === "leaving") return;
  const x = Math.floor(v.x);
  const y = Math.floor(v.y) - (v.kind === "bus" || v.kind === "truck" || v.kind === "limo" ? 26 : 20);

  // fuel tank size indicator (yellow bar, width = priority)
  const tankPct = Math.min(1, v.tank / 170);
  const w = Math.floor(20 + tankPct * 26);
  ctx.fillStyle = "#1a2436";
  ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 6);
  // fill ratio shows tank size
  ctx.fillStyle = v.vip ? "#ffd84a" : tankPct > 0.7 ? "#e85050" : tankPct > 0.4 ? "#f0b03e" : "#62c46a";
  ctx.fillRect(x - w / 2, y, w, 4);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(x - w / 2, y, w, 1);

  // fuel progress (filled / tank)
  const fillW = Math.floor(((v.filled / v.tank) || 0) * 24);
  ctx.fillStyle = "#1a2436";
  ctx.fillRect(x - 13, y + 7, 26, 4);
  ctx.fillStyle = "#7ec8e3";
  ctx.fillRect(x - 12, y + 8, fillW, 2);

  // patience bar (small)
  const pct = Math.max(0, v.patience / v.maxPatience);
  ctx.fillStyle = "#1a2436";
  ctx.fillRect(x - 13, y + 12, 26, 3);
  ctx.fillStyle = pct > 0.5 ? "#62c46a" : pct > 0.25 ? "#f0b03e" : "#e85050";
  ctx.fillRect(x - 12, y + 13, Math.floor(pct * 24), 1);
}

function drawPrompt(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(x - 26, y - 8, 52, 12);
  ctx.fillStyle = "#ffd84a";
  ctx.font = "6px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}
