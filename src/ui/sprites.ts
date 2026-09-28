// Inline pixel-art sprites (SVG with crisp edges).

const PORTAL_COLORS = ["#97ce4c", "#5fa83a", "#c8f07a"];

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
