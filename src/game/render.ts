import { GameState, Vehicle } from "./state";
import { LevelTheme } from "./levels";
import { MAP_H, MAP_W, PUMPS, PUMP_SPOTS, SHOP, TILE } from "./world";

export function drawScene(ctx: CanvasRenderingContext2D, s: GameState, vw: number, vh: number) {
  const th = s.levelConfig.theme;
  ctx.fillStyle = th.sky;
  ctx.fillRect(0, 0, vw, vh);

  ctx.save();
  ctx.translate(-Math.floor(s.cam.x), -Math.floor(s.cam.y));

  drawGrass(ctx, th);
  drawRoad(ctx, 13 * TILE, 4 * TILE, th);
  drawRoad(ctx, 21 * TILE, 4 * TILE, th);
  drawConcrete(ctx, 22 * TILE, 8 * TILE, 30 * TILE, 18 * TILE, th);
  drawShop(ctx, th);
  drawCanopy(ctx, 23 * TILE, 9 * TILE, 28 * TILE, 4 * TILE, th, s.levelConfig.theme.signTitle);
  drawCanopy(ctx, 23 * TILE, 17 * TILE, 28 * TILE, 4 * TILE, th, s.levelConfig.theme.signTitle);

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

  // priority indicator above next-priority vehicle (VIP > biggest tank)
  const priority = pickPriorityVehicle(s.vehicles);
  if (priority) drawPriorityCrown(ctx, priority);

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
    ctx.fillStyle = "#F9B91B";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`x2 BONUS! ${s.bonusActive.toFixed(1)}s`, ctx.canvas.width / 2, 15);
    ctx.restore();
  }
}

// ---------- helpers ----------

function drawGrass(ctx: CanvasRenderingContext2D, th: LevelTheme) {
  ctx.fillStyle = th.grass;
  ctx.fillRect(0, 0, MAP_W * TILE, MAP_H * TILE);
  ctx.fillStyle = shadeHex(th.grass, -10);
  for (let y = 0; y < MAP_H * TILE; y += 8) {
    if ((y / 8) % 2 === 0) ctx.fillRect(0, y, MAP_W * TILE, 4);
  }
  for (let i = 0; i < 320; i++) {
    const x = (i * 137 + 13) % (MAP_W * TILE);
    const y = (i * 71 + 29) % (MAP_H * TILE);
    if (x > 21 * TILE && x < 53 * TILE && y > 7 * TILE && y < 27 * TILE) continue;
    ctx.fillStyle = i % 3 ? shadeHex(th.grass, 14) : shadeHex(th.grass, -22);
    ctx.fillRect(x, y, 1, 1);
  }
  for (let bx = 1; bx < MAP_W - 1; bx += 3) {
    drawBush(ctx, bx * TILE, 5 * TILE);
    drawBush(ctx, bx * TILE, 29 * TILE);
  }
  for (let by = 9; by < 27; by += 3) {
    drawBush(ctx, 2 * TILE, by * TILE);
    drawBush(ctx, 67 * TILE, by * TILE);
  }
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 9, 13, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f6b1f";
  ctx.beginPath();
  ctx.arc(x - 6, y + 3, 7, 0, Math.PI * 2);
  ctx.arc(x + 6, y + 3, 7, 0, Math.PI * 2);
  ctx.arc(x, y - 1, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4B7D1D";
  ctx.beginPath();
  ctx.arc(x - 5, y + 1, 6, 0, Math.PI * 2);
  ctx.arc(x + 5, y + 1, 6, 0, Math.PI * 2);
  ctx.arc(x, y - 3, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7cc04a";
  ctx.beginPath();
  ctx.arc(x - 4, y - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 3, y - 3, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoad(ctx: CanvasRenderingContext2D, y: number, h: number, th: LevelTheme) {
  const base = th.era === "mega" ? "#2a2a35" : th.era === "bote-bote" ? "#a08858" : "#b8b8b8";
  ctx.fillStyle = base;
  ctx.fillRect(0, y, MAP_W * TILE, h);
  for (let i = 0; i < 240; i++) {
    const px = (i * 53) % (MAP_W * TILE);
    const py = y + ((i * 17) % h);
    ctx.fillStyle = i % 3 ? shadeHex(base, -10) : shadeHex(base, 14);
    ctx.fillRect(px, py, 1, 1);
  }
  ctx.fillStyle = shadeHex(base, -25);
  ctx.fillRect(0, y - 1, MAP_W * TILE, 2);
  ctx.fillRect(0, y + h - 1, MAP_W * TILE, 2);
  ctx.fillStyle = th.era === "mega" ? "#ff2bd6" : "#F9B91B";
  for (let x = 0; x < MAP_W * TILE; x += 32) {
    ctx.fillRect(x, y + h / 2 - 1, 14, 2);
  }
}

function drawConcrete(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, th: LevelTheme) {
  const base = th.pad;
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = shadeHex(base, 12);
  ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = shadeHex(base, -25);
  for (let i = 0; i <= w; i += 48) ctx.fillRect(x + i, y, 1, h);
  for (let i = 0; i <= h; i += 48) ctx.fillRect(x, y + i, w, 1);
  for (let i = 0; i < 180; i++) {
    const px = x + ((i * 47) % w);
    const py = y + ((i * 31) % h);
    ctx.fillStyle = i % 2 ? shadeHex(base, 12) : shadeHex(base, -12);
    ctx.fillRect(px, py, 1, 1);
  }
  ctx.fillStyle = shadeHex(base, -30);
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillRect(x, y, 2, h);
  ctx.fillRect(x + w - 2, y, 2, h);
}

function drawCanopy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, th: LevelTheme, title: string) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(x + 3, y + h + 1, w, 5);
  ctx.fillStyle = "#cdd2db";
  ctx.fillRect(x + 2, y + h, 5, 12);
  ctx.fillRect(x + w - 7, y + h, 5, 12);
  ctx.fillRect(x + Math.floor(w / 2) - 8, y + h, 5, 12);
  ctx.fillRect(x + Math.floor(w / 2) + 3, y + h, 5, 12);
  ctx.fillStyle = "#8a8a8a";
  ctx.fillRect(x + 6, y + h, 1, 12);
  ctx.fillRect(x + w - 3, y + h, 1, 12);
  ctx.fillStyle = "#595959";
  ctx.fillRect(x + 1, y + h + 11, 7, 2);
  ctx.fillRect(x + w - 8, y + h + 11, 7, 2);
  ctx.fillRect(x + Math.floor(w / 2) - 9, y + h + 11, 7, 2);
  ctx.fillRect(x + Math.floor(w / 2) + 2, y + h + 11, 7, 2);
  ctx.fillStyle = th.canopy;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = shadeHex(th.canopy, 18);
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = "#F7F9F9";
  ctx.fillRect(x, y + h - 5, w, 2);
  ctx.fillStyle = th.canopyTrim;
  ctx.fillRect(x, y + h - 2, w, 2);
  const lx = x + Math.floor(w / 2) - 18, ly = y + 1;
  ctx.fillStyle = "#002147";
  ctx.fillRect(lx, ly, 36, h - 4);
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(lx + 1, ly + 1, 34, h - 6);
  ctx.fillStyle = "#002147";
  ctx.font = "5px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText(title, lx + 18, ly + Math.floor(h / 2) + 1);
}

function drawShop(ctx: CanvasRenderingContext2D, th: LevelTheme) {
  const x = SHOP.x - 32, y = SHOP.y - 30, w = 64, h = 56;
  // ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x + 2, y + h, w, 4);
  // back wall (cream brick)
  ctx.fillStyle = th.shopWall;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = shadeHex(th.shopWall, -10);
  for (let i = 0; i < h; i += 4) ctx.fillRect(x, y + i, w, 1);
  ctx.fillStyle = shadeHex(th.shopWall, -35);
  ctx.fillRect(x, y + h - 4, w, 4);
  ctx.fillStyle = shadeHex(th.shopWall, -20);
  ctx.fillRect(x, y + h - 4, w, 1);
  ctx.fillStyle = th.shopRoof;
  ctx.fillRect(x - 3, y - 8, w + 6, 10);
  ctx.fillStyle = shadeHex(th.shopRoof, 20);
  ctx.fillRect(x - 3, y - 8, w + 6, 6);
  ctx.fillStyle = shadeHex(th.shopRoof, 40);
  ctx.fillRect(x - 3, y - 8, w + 6, 2);
  ctx.fillStyle = th.shopRoof;
  for (let i = 0; i < w + 6; i += 6) ctx.fillRect(x - 3 + i, y - 8, 1, 6);
  // sign awning
  ctx.fillStyle = "#002147";
  ctx.fillRect(x + 4, y + 4, w - 8, 9);
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x + 5, y + 5, w - 10, 7);
  ctx.fillStyle = "#002147";
  ctx.font = "5px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText("SHOP", x + w / 2, y + 10);
  // door
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(x + w / 2 - 7, y + h - 22, 14, 18);
  ctx.fillStyle = "#5b3a22";
  ctx.fillRect(x + w / 2 - 6, y + h - 21, 12, 16);
  // door window
  ctx.fillStyle = "#43B2D6";
  ctx.fillRect(x + w / 2 - 4, y + h - 19, 8, 6);
  ctx.fillStyle = "#1D55A4";
  ctx.fillRect(x + w / 2 - 4, y + h - 17, 8, 1);
  // doorknob
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x + w / 2 + 4, y + h - 12, 1, 2);
  // big windows
  drawWindow(ctx, x + 5, y + 18);
  drawWindow(ctx, x + w - 17, y + 18);
  // potted plant
  ctx.fillStyle = "#8a6a3a";
  ctx.fillRect(x + 2, y + h - 6, 4, 3);
  ctx.fillStyle = "#4B7D1D";
  ctx.fillRect(x + 1, y + h - 9, 6, 4);
  ctx.fillStyle = "#3c8049";
  ctx.fillRect(x + 2, y + h - 10, 2, 2);
  ctx.fillRect(x + 4, y + h - 9, 2, 2);
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // frame
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(x, y, 12, 14);
  // glass
  ctx.fillStyle = "#1D55A4";
  ctx.fillRect(x + 1, y + 1, 10, 12);
  // light reflection
  ctx.fillStyle = "#43B2D6";
  ctx.fillRect(x + 1, y + 1, 10, 3);
  ctx.fillRect(x + 1, y + 6, 4, 1);
  // mullions
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(x + 5, y + 1, 1, 12);
  ctx.fillRect(x + 1, y + 6, 10, 1);
  // sill
  ctx.fillStyle = "#8a6a3a";
  ctx.fillRect(x - 1, y + 14, 14, 2);
}

function drawSign(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // pole (with base)
  ctx.fillStyle = "#595959";
  ctx.fillRect(x + 12, y + 14, 4, 32);
  ctx.fillStyle = "#8a8a8a";
  ctx.fillRect(x + 13, y + 14, 1, 32);
  ctx.fillStyle = "#404040";
  ctx.fillRect(x + 9, y + 44, 10, 3);
  // big square sign
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 10, y - 4, 48, 22);
  ctx.fillStyle = "#ED1C24";
  ctx.fillRect(x - 8, y - 2, 44, 18);
  // gold inner
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 7, y - 1, 42, 9);
  ctx.fillStyle = "#002147";
  ctx.font = "5px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText("UPGRADE", x + 14, y + 5);
  // price LED
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 6, y + 9, 40, 7);
  ctx.fillStyle = "#62c46a";
  ctx.font = "5px 'Press Start 2P', monospace";
  ctx.fillText("E TO OPEN", x + 14, y + 14);
}

function drawLockedPump(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.globalAlpha = 0.35;
  drawPump(ctx, x, y);
  ctx.globalAlpha = 1;
  // padlock
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 4, y + 2, 8, 7);
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 3, y + 3, 6, 5);
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 1, y + 5, 2, 2);
  // shackle
  ctx.fillStyle = "#8a8a8a";
  ctx.fillRect(x - 3, y, 1, 3);
  ctx.fillRect(x + 2, y, 1, 3);
  ctx.fillRect(x - 3, y - 1, 6, 1);
}

function drawPump(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // base concrete pad
  ctx.fillStyle = "#595959";
  ctx.fillRect(x - 12, y + 16, 24, 5);
  ctx.fillStyle = "#6e6e6e";
  ctx.fillRect(x - 12, y + 16, 24, 1);
  // bumper posts (yellow/black)
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - 11, y + 12, 2, 5);
  ctx.fillRect(x + 9, y + 12, 2, 5);
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 11, y + 13, 2, 1);
  ctx.fillRect(x + 9, y + 13, 2, 1);

  // body shadow side
  ctx.fillStyle = "#660011";
  ctx.fillRect(x + 6, y - 6, 3, 22);
  // body main
  ctx.fillStyle = "#ED1C24";
  ctx.fillRect(x - 8, y - 6, 14, 22);
  // body top highlight
  ctx.fillStyle = "#F04040";
  ctx.fillRect(x - 8, y - 6, 14, 2);
  ctx.fillStyle = "#f87070";
  ctx.fillRect(x - 8, y - 6, 1, 22);

  // top cap
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 9, y - 9, 16, 4);
  ctx.fillStyle = "#1D55A4";
  ctx.fillRect(x - 9, y - 9, 16, 1);

  // screen panel
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 6, y - 3, 12, 7);
  ctx.fillStyle = "#62c46a";
  ctx.fillRect(x - 5, y - 2, 10, 1);
  ctx.fillStyle = "#3aa84e";
  ctx.fillRect(x - 5, y, 2, 1);
  ctx.fillRect(x - 2, y, 2, 1);
  ctx.fillRect(x + 1, y, 2, 1);
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 5, y + 2, 4, 1);

  // logo stripe (yellow with text)
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 8, y + 6, 14, 4);
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 8, y + 7, 14, 2);

  // nozzle holster on side
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x + 6, y + 11, 5, 5);
  // hose curving down
  ctx.strokeStyle = "#0e0e0e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 4);
  ctx.bezierCurveTo(x + 16, y + 6, x + 16, y + 14, x + 11, y + 14);
  ctx.stroke();
  // nozzle gun
  ctx.fillStyle = "#404040";
  ctx.fillRect(x + 8, y + 12, 5, 4);
  ctx.fillStyle = "#888d9b";
  ctx.fillRect(x + 11, y + 13, 2, 2);
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x + 8, y + 12, 1, 1);

  // small price card on top
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 4, y - 13, 8, 4);
  ctx.fillStyle = "#ED1C24";
  ctx.fillRect(x - 3, y - 12, 6, 2);
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#5b3a22";
  ctx.fillRect(x - 1, y + 8, 3, 6);
  ctx.fillStyle = "#4B7D1D";
  ctx.fillRect(x - 6, y, 13, 10);
  ctx.fillRect(x - 4, y - 4, 9, 6);
  ctx.fillStyle = "#5d9626";
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
  ctx.fillStyle = "#F7F9F9";
  ctx.fillRect(x - 2, y + 1, 4, 1);
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: GameState) {
  const p = s.player;
  const x = Math.floor(p.x);
  const y = Math.floor(p.y);
  const bob = Math.floor(Math.sin(p.walkT) * 1);
  const armSwing = Math.floor(Math.sin(p.walkT) * 2);

  // round shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x - 6, y + 9, 12, 2);
  ctx.fillRect(x - 5, y + 10, 10, 1);

  // legs (navy with boot toes)
  ctx.fillStyle = "#1D55A4";
  ctx.fillRect(x - 4, y + 4 + bob, 3, 5);
  ctx.fillRect(x + 1, y + 4 - bob, 3, 5);
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 4, y + 8 + bob, 3, 1);
  ctx.fillRect(x + 1, y + 8 - bob, 3, 1);
  // boots (black)
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(x - 4, y + 9 + bob, 4, 1);
  ctx.fillRect(x + 1, y + 9 - bob, 4, 1);

  // body coveralls (red) with shading
  ctx.fillStyle = "#ED1C24";
  ctx.fillRect(x - 5, y - 3, 10, 8);
  // shadow side
  ctx.fillStyle = "#990018";
  ctx.fillRect(x + 3, y - 3, 2, 8);
  // highlight
  ctx.fillStyle = "#F04040";
  ctx.fillRect(x - 5, y - 3, 1, 8);
  // chest yellow stripe with name patch
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 5, y, 10, 2);
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 4, y, 1, 1);
  ctx.fillRect(x + 3, y, 1, 1);
  // collar
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 3, y - 3, 6, 1);
  // belt
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - 5, y + 4, 10, 1);
  // belt buckle
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 1, y + 4, 2, 1);
  // pocket
  ctx.fillStyle = "#990018";
  ctx.fillRect(x - 4, y + 2, 3, 2);

  // arms (swing)
  ctx.fillStyle = "#ED1C24";
  if (!p.pumping) {
    ctx.fillRect(x - 7, y - 2 + armSwing, 2, 5);
    ctx.fillRect(x + 5, y - 2 - armSwing, 2, 5);
    // gloves
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x - 7, y + 3 + armSwing, 2, 1);
    ctx.fillRect(x + 5, y + 3 - armSwing, 2, 1);
  } else {
    // both arms forward holding nozzle
    ctx.fillRect(x - 7, y - 1, 2, 4);
    ctx.fillRect(x + 5, y - 1, 2, 4);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x - 7, y + 3, 2, 1);
    ctx.fillRect(x + 5, y + 3, 2, 1);
  }

  // neck
  ctx.fillStyle = "#d8a878";
  ctx.fillRect(x - 2, y - 4, 4, 1);

  // head (face)
  ctx.fillStyle = "#f0c896";
  ctx.fillRect(x - 4, y - 10, 8, 7);
  // jaw shadow
  ctx.fillStyle = "#d8a878";
  ctx.fillRect(x - 4, y - 4, 8, 1);
  // sideburns
  ctx.fillStyle = "#3a2418";
  ctx.fillRect(x - 4, y - 7, 1, 3);
  ctx.fillRect(x + 3, y - 7, 1, 3);

  // cap (red with yellow front and visor)
  ctx.fillStyle = "#ED1C24";
  ctx.fillRect(x - 5, y - 13, 10, 4);
  ctx.fillStyle = "#F04040";
  ctx.fillRect(x - 5, y - 13, 10, 1);
  // hat band
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 5, y - 10, 10, 1);
  // hat front patch (yellow with G)
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 2, y - 12, 4, 2);
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 1, y - 11, 2, 1);
  // visor by direction
  ctx.fillStyle = "#002147";
  if (p.facing === "down") {
    ctx.fillRect(x - 5, y - 9, 10, 1);
  } else if (p.facing === "left") {
    ctx.fillRect(x - 7, y - 9, 4, 1);
  } else if (p.facing === "right") {
    ctx.fillRect(x + 3, y - 9, 4, 1);
  } else {
    ctx.fillRect(x - 5, y - 14, 10, 1);
  }

  // girl: ponytail + bow
  if (s.character === "girl") {
    ctx.fillStyle = "#3a2418";
    ctx.fillRect(x - 6, y - 6, 1, 5);
    ctx.fillRect(x - 7, y - 4, 1, 4);
    ctx.fillRect(x + 5, y - 6, 1, 5);
    ctx.fillRect(x + 6, y - 4, 1, 4);
    // bow
    ctx.fillStyle = "#ED1C24";
    ctx.fillRect(x - 3, y - 13, 2, 2);
    ctx.fillRect(x + 1, y - 13, 2, 2);
    ctx.fillStyle = "#F9B91B";
    ctx.fillRect(x - 1, y - 12, 2, 1);
    // earrings
    ctx.fillStyle = "#F9B91B";
    ctx.fillRect(x - 5, y - 6, 1, 1);
    ctx.fillRect(x + 4, y - 6, 1, 1);
  }
  // eyes
  ctx.fillStyle = "#002147";
  if (p.facing === "down") {
    ctx.fillRect(x - 2, y - 7, 1, 1);
    ctx.fillRect(x + 1, y - 7, 1, 1);
    // smile
    ctx.fillRect(x - 1, y - 5, 2, 1);
  } else if (p.facing === "left") {
    ctx.fillRect(x - 3, y - 7, 1, 1);
  } else if (p.facing === "right") {
    ctx.fillRect(x + 2, y - 7, 1, 1);
  }

  // pump nozzle in hands when pumping
  if (p.pumping) {
    ctx.fillStyle = "#404040";
    ctx.fillRect(x + 5, y - 1, 6, 3);
    ctx.fillStyle = "#888d9b";
    ctx.fillRect(x + 10, y, 2, 1);
    // hose dangling
    ctx.strokeStyle = "#0e0e0e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 11, y + 2);
    ctx.quadraticCurveTo(x + 14, y + 6, x + 12, y + 9);
    ctx.stroke();
    // fuel sparkle
    if ((p.walkT * 4) % 1 < 0.5) {
      ctx.fillStyle = "#F9B91B";
      ctx.fillRect(x + 12, y - 2, 1, 1);
      ctx.fillRect(x + 13, y - 1, 1, 1);
    }
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
    ctx.fillStyle = "#F9B91B";
    ctx.fillRect(x - 1, y - 18, 2, 6);
    ctx.fillRect(x - 3, y - 16, 6, 2);
    ctx.fillStyle = "#F7F9F9";
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
  ctx.fillStyle = "#43B2D6";
  ctx.fillRect(x - 8, y - 6, 7, 4);
  ctx.fillRect(x + 1, y - 6, 7, 4);
  ctx.fillStyle = shade(color, 20);
  ctx.fillRect(x - 14, y - 2, 28, 1);
  // wheels
  drawWheel(ctx, x - 9, y + 6);
  drawWheel(ctx, x + 9, y + 6);
  // headlights
  ctx.fillStyle = "#F7F9F9";
  ctx.fillRect(x + 13, y, 2, 2);
  ctx.fillStyle = "#ED1C24";
  ctx.fillRect(x - 14, y, 1, 2);
}

function drawVan(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 16, y - 4, 32, 10);
  ctx.fillRect(x - 16, y - 9, 24, 6);
  ctx.fillStyle = shade(color, -25);
  ctx.fillRect(x - 16, y + 4, 32, 2);
  ctx.fillStyle = "#43B2D6";
  ctx.fillRect(x - 15, y - 8, 8, 4);
  ctx.fillRect(x - 6, y - 8, 8, 4);
  drawWheel(ctx, x - 11, y + 6);
  drawWheel(ctx, x + 11, y + 6);
  ctx.fillStyle = "#F7F9F9";
  ctx.fillRect(x + 14, y, 2, 2);
}

function drawTruck(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  // trailer
  ctx.fillStyle = "#d0d4dc";
  ctx.fillRect(x - 18, y - 8, 22, 14);
  ctx.fillStyle = "#8a8a8a";
  ctx.fillRect(x - 18, y + 4, 22, 2);
  ctx.fillStyle = "#5b6170";
  ctx.fillRect(x - 17, y - 7, 20, 2);
  // cab
  ctx.fillStyle = color;
  ctx.fillRect(x + 4, y - 5, 14, 11);
  ctx.fillStyle = "#43B2D6";
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
  ctx.fillStyle = "#43B2D6";
  for (let i = 0; i < 5; i++) ctx.fillRect(x - 16 + i * 7, y - 7, 5, 5);
  // door
  ctx.fillStyle = "#002147";
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
  ctx.fillStyle = "#1D55A4";
  ctx.fillRect(x - 13, y - 7, 8, 4);
  ctx.fillRect(x - 4, y - 7, 6, 4);
  ctx.fillRect(x + 3, y - 7, 8, 4);
  // gold trim
  ctx.fillStyle = "#F9B91B";
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

function shadeHex(hex: string, amt: number) {
  const c = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(c.substring(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(c.substring(2, 4), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(c.substring(4, 6), 16) + amt));
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
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
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 6);
  // fill ratio shows tank size
  ctx.fillStyle = v.vip ? "#F9B91B" : tankPct > 0.7 ? "#F04040" : tankPct > 0.4 ? "#f0b03e" : "#62c46a";
  ctx.fillRect(x - w / 2, y, w, 4);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(x - w / 2, y, w, 1);

  // fuel progress (filled / tank)
  const fillW = Math.floor(((v.filled / v.tank) || 0) * 24);
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 13, y + 7, 26, 4);
  ctx.fillStyle = "#1D55A4";
  ctx.fillRect(x - 12, y + 8, fillW, 2);

  // patience bar (small)
  const pct = Math.max(0, v.patience / v.maxPatience);
  ctx.fillStyle = "#002147";
  ctx.fillRect(x - 13, y + 12, 26, 3);
  ctx.fillStyle = pct > 0.5 ? "#62c46a" : pct > 0.25 ? "#f0b03e" : "#F04040";
  ctx.fillRect(x - 12, y + 13, Math.floor(pct * 24), 1);

  // anger emoji when patience low
  if (pct < 0.4 && (v.state === "waiting" || v.state === "pumping")) {
    const ay = y - 10;
    const t = performance.now() / 80;
    const sh = Math.floor(Math.sin(t) * 1);
    ctx.fillStyle = "#ED1C24";
    ctx.fillRect(x - 4 + sh, ay, 8, 7);
    ctx.fillStyle = "#F04040";
    ctx.fillRect(x - 4 + sh, ay, 8, 1);
    // angry brows
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(x - 3 + sh, ay + 2, 2, 1);
    ctx.fillRect(x + 1 + sh, ay + 2, 2, 1);
    // mouth
    ctx.fillRect(x - 2 + sh, ay + 5, 4, 1);
    // steam
    if (pct < 0.2) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(x - 6 + sh, ay - 2, 1, 1);
      ctx.fillRect(x + 5 + sh, ay - 2, 1, 1);
    }
  }
}

function drawPrompt(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(x - 26, y - 8, 52, 12);
  ctx.fillStyle = "#F9B91B";
  ctx.font = "6px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

export function pickPriorityVehicle(vs: Vehicle[]): Vehicle | null {
  const ready = vs.filter((v) => v.state === "waiting" || v.state === "pumping");
  if (!ready.length) return null;
  // VIPs first, then biggest tank
  ready.sort((a, b) => {
    if (a.vip !== b.vip) return a.vip ? -1 : 1;
    return b.tank - a.tank;
  });
  return ready[0];
}

function drawPriorityCrown(ctx: CanvasRenderingContext2D, v: Vehicle) {
  const x = Math.floor(v.x);
  const y = Math.floor(v.y) - (v.kind === "bus" || v.kind === "truck" || v.kind === "limo" ? 36 : 30);
  // bobbing
  const bob = Math.floor(Math.sin(performance.now() / 220) * 1);
  const yy = y + bob;
  // arrow
  ctx.fillStyle = "#F9B91B";
  ctx.fillRect(x - 4, yy + 4, 8, 2);
  ctx.fillRect(x - 3, yy + 6, 6, 1);
  ctx.fillRect(x - 2, yy + 7, 4, 1);
  ctx.fillRect(x - 1, yy + 8, 2, 1);
  // crown body
  ctx.fillStyle = v.vip ? "#F9B91B" : "#43B2D6";
  ctx.fillRect(x - 5, yy + 1, 10, 3);
  ctx.fillStyle = v.vip ? "#fff5b8" : "#a0e0f0";
  ctx.fillRect(x - 5, yy + 1, 10, 1);
  // crown spikes
  ctx.fillStyle = v.vip ? "#F9B91B" : "#43B2D6";
  ctx.fillRect(x - 5, yy - 1, 2, 2);
  ctx.fillRect(x - 1, yy - 2, 2, 3);
  ctx.fillRect(x + 3, yy - 1, 2, 2);
  // gem
  ctx.fillStyle = v.vip ? "#ED1C24" : "#1D55A4";
  ctx.fillRect(x - 1, yy + 2, 2, 1);
  // label
  ctx.fillStyle = "#002147";
  ctx.font = "5px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText(v.vip ? "VIP" : "BIG", x, yy - 4);
}
