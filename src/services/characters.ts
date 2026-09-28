// Character pool from the Rick and Morty API (spec.md > Characters).
// Images are shown live from the source and never stored.

/** Curated pool: 30 characters with distinct looks, confirmed against the API. */
export const POOL_IDS: readonly number[] = [
  1, 2, 3, 4, 5, 6, 7, 20, 23, 26, 35, 47, 71, 82, 118, 130, 142, 192, 196, 240, 242, 244, 265,
  282, 306, 329, 331, 353, 372, 562,
];

const API = "https://rickandmortyapi.com/api/character/";

export interface Character {
  id: number;
  name: string | null;
  imageUrl: string | null;
}

type FetchFn = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

/** One request for the whole pool. Never throws: on failure every character has no image. */
export async function fetchPool(
  ids: readonly number[] = POOL_IDS,
  fetchFn: FetchFn = (url) => fetch(url),
): Promise<Map<number, Character>> {
  const result = new Map<number, Character>(ids.map((id) => [id, { id, name: null, imageUrl: null }]));
  try {
    const res = await fetchFn(API + ids.join(","));
    if (!res.ok) return result;
    const data = await res.json();
    if (!Array.isArray(data)) return result;
    for (const item of data) {
      if (item && typeof item.id === "number" && result.has(item.id)) {
        result.set(item.id, {
          id: item.id,
          name: typeof item.name === "string" ? item.name : null,
          imageUrl: typeof item.image === "string" ? item.image : null,
        });
      }
    }
  } catch {
    // Offline or API down: fallback tiles.
  }
  return result;
}

export type ImageLoader = (url: string) => Promise<HTMLImageElement>;

export const browserImageLoader: ImageLoader = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image failed: ${url}`));
    img.src = url;
  });

/**
 * Preloads the images for the given characters with Promise.allSettled, so one
 * failed image doesn't sink the rest. Failed or missing images map to null.
 */
export async function preloadImages(
  ids: readonly number[],
  pool: Map<number, Character>,
  loader: ImageLoader = browserImageLoader,
): Promise<Map<number, HTMLImageElement | null>> {
  const results = await Promise.allSettled(
    ids.map((id) => {
      const url = pool.get(id)?.imageUrl;
      return url ? loader(url) : Promise.reject(new Error(`No image for ${id}`));
    }),
  );
  return new Map(ids.map((id, i) => {
    const r = results[i];
    return [id, r && r.status === "fulfilled" ? r.value : null];
  }));
}
