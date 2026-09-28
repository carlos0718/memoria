// Card faces: the 300×300 image drawn into a small canvas and scaled up with
// `image-rendering: pixelated`, or a retro number tile when the image is missing.

const PIXELS = 64;
const TILE_COLORS = ["#97ce4c", "#44d9e6", "#ffd23f", "#ff4f9a", "#b48cff", "#ff9f43"];

export function faceElement(
  image: HTMLImageElement | null,
  characterId: number,
  poolIds: readonly number[],
): HTMLElement {
  if (image) {
    const canvas = document.createElement("canvas");
    canvas.width = PIXELS;
    canvas.height = PIXELS;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true; // average while shrinking, then show hard pixels
      ctx.drawImage(image, 0, 0, PIXELS, PIXELS);
      return canvas;
    }
  }
  const index = Math.max(0, poolIds.indexOf(characterId));
  const tile = document.createElement("div");
  tile.className = "fallback-tile";
  tile.style.background = TILE_COLORS[index % TILE_COLORS.length]!;
  tile.textContent = String(index + 1);
  return tile;
}
