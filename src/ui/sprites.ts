// Inline pixel-art sprites (SVG with crisp edges).

const PORTAL_COLORS = ["#97ce4c", "#5fa83a", "#c8f07a"];

// Rows of a 12×12 pointing hand (index finger up-left). "#" = outline, "o" = fill.
const HAND = [
  "..##........",
  ".#oo#.......",
  ".#oo#.......",
  ".#oo###.....",
  ".#oo#oo##...",
  ".#oo#oo#o##.",
  "##oooooooo#.",
  "#ooooooooo#.",
  "#ooooooooo#.",
  ".#ooooooo#..",
  "..#ooooo#...",
  "...#####....",
];

/** Pixel pointing hand, fingertip at the top-left corner. */
export function handSvg(): string {
  let rects = "";
  HAND.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${ch === "#" ? "#000" : "#fff"}"/>`;
    });
  });
  return `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

/** 16×16 pixel portal swirl for the card back. */
export function portalSvg(): string {
  const size = 16;
  const c = (size - 1) / 2;
  let rects = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c;
      const dy = y - c;
      const d = Math.hypot(dx, dy);
      if (d > 7) continue;
      const swirl = Math.floor(d * 0.9 + (Math.atan2(dy, dx) / Math.PI) * 1.5 + 3);
      const color = PORTAL_COLORS[((swirl % 3) + 3) % 3];
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

// Fill-only pixel maps; the black outline is added automatically around them.
const FILL: Record<string, string> = {
  y: "#ffd23f",
  w: "#fff7c2",
  o: "#a8672b",
  g: "#b8c4d6",
  d: "#6b7a90",
  c: "#44d9e6",
  r: "#ff4f9a",
};

const TROPHY = [
  "..yyyyyyyy..",
  "yyywyyyyyyyy",
  "y.ywyyyyyy.y",
  "y.ywyyyyyy.y",
  "yyyyyyyyyyyy",
  "..yyyyyyyy..",
  "...yyyyyy...",
  "....yyyy....",
  ".....yy.....",
  ".....yy.....",
  "...yyyyyy...",
  "..oooooooo..",
  "..oooooooo..",
];

const ROBOT_WITH_TROPHY = [
  ".....yyyy.....",
  "....yyyyyy....",
  "g...wyyyyy...g",
  "g....yyyy....g",
  "g.....yy.....g",
  "g....oooo....g",
  "gg..........gg",
  ".g..........g.",
  ".gggggggggggg.",
  "..gccggggccg..",
  "..gggggggggg..",
  "..ggrrrrrrgg..",
  "..gggggggggg..",
  "...dddddddd...",
  "...dd....dd...",
  "...dd....dd...",
];

function outlinedSvg(rows: string[], className: string): string {
  const h = rows.length + 2;
  const w = rows[0]!.length + 2;
  const at = (x: number, y: number) => rows[y - 1]?.[x - 1] ?? ".";
  let rects = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = at(x, y);
      let fill = FILL[ch];
      if (!fill) {
        const edge = [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)].some((n) => n !== ".");
        if (!edge) continue;
        fill = "#000";
      }
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`;
    }
  }
  return `<svg class="${className}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

export function trophySvg(): string {
  return outlinedSvg(TROPHY, "sprite-trophy");
}

export function robotSvg(): string {
  return outlinedSvg(ROBOT_WITH_TROPHY, "sprite-robot");
}
