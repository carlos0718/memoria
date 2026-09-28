import { describe, expect, it } from "vitest";
import { fetchPool, POOL_IDS, preloadImages, type ImageLoader } from "./characters";

const okFetch = (items: unknown[]) => async () => ({ ok: true, json: async () => items });

describe("characters", () => {
  it("has a pool big enough for level 5 with no duplicates", () => {
    expect(new Set(POOL_IDS).size).toBe(POOL_IDS.length);
    expect(POOL_IDS.length).toBeGreaterThanOrEqual(14);
  });

  it("requests the whole pool in one call", async () => {
    const urls: string[] = [];
    await fetchPool([1, 2, 3], async (url) => {
      urls.push(url);
      return { ok: true, json: async () => [] };
    });
    expect(urls).toEqual(["https://rickandmortyapi.com/api/character/1,2,3"]);
  });

  it("maps names and images from the response", async () => {
    const pool = await fetchPool([1, 2], okFetch([{ id: 1, name: "Rick Sanchez", image: "r.jpeg" }]));
    expect(pool.get(1)).toEqual({ id: 1, name: "Rick Sanchez", imageUrl: "r.jpeg" });
    expect(pool.get(2)).toEqual({ id: 2, name: null, imageUrl: null });
  });

  it("falls back (no throw) when the API is down or returns an error", async () => {
    const down = await fetchPool([1], async () => {
      throw new Error("offline");
    });
    expect(down.get(1)?.imageUrl).toBeNull();
    const err = await fetchPool([1], async () => ({ ok: false, json: async () => ({}) }));
    expect(err.get(1)?.imageUrl).toBeNull();
  });

  it("allSettled: one failed image becomes null, the rest still load", async () => {
    const pool = await fetchPool(
      [1, 2, 3],
      okFetch([
        { id: 1, name: "A", image: "ok-1" },
        { id: 2, name: "B", image: "fail-2" },
        { id: 3, name: "C", image: "ok-3" },
      ]),
    );
    const fakeImg = {} as HTMLImageElement;
    const loader: ImageLoader = async (url) => {
      if (url.startsWith("fail")) throw new Error("broken");
      return fakeImg;
    };
    const images = await preloadImages([1, 2, 3], pool, loader);
    expect(images.get(1)).toBe(fakeImg);
    expect(images.get(2)).toBeNull();
    expect(images.get(3)).toBe(fakeImg);
  });
});
