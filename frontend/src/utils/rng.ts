/**
 * Deterministic Seeded PRNG (mulberry32)
 *
 * The open-world island is generated procedurally at render time. Using
 * `Math.random()` there makes the world unstable: every remount (HMR, Strict
 * Mode double-render, React Compiler memo invalidation) reshuffles thousands of
 * grass tufts, trees and clouds. A seeded generator keeps the island identical
 * across renders while staying just as varied visually.
 */

export type Rng = {
  /** Uniform float in [0, 1). */
  next: () => number;
  /** Uniform float in [min, max). */
  range: (min: number, max: number) => number;
  /** Uniform integer in [0, max). */
  int: (max: number) => number;
  /** Random element of a non-empty array. */
  pick: <T>(items: readonly T[]) => T;
};

/** Creates an independent, deterministic generator for the given seed. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const range = (min: number, max: number) => min + next() * (max - min);
  const int = (max: number) => Math.floor(next() * max);

  return {
    next,
    range,
    int,
    pick: <T,>(items: readonly T[]) => items[int(items.length)],
  };
}

/** Stable seeds so each world layer keeps its own reproducible variation. */
export const WORLD_SEEDS = {
  grass: 0x48415744, // "HAWD"
  flowers: 0x464c5752, // "FLWR"
  clouds: 0x434c4455, // "CLDU"
  leaves: 0x4c454146, // "LEAF"
  pollen: 0x504f4c4e, // "POLN"
  rain: 0x5241494e, // "RAIN"
  props: 0x50524f50, // "PROP"
  islands: 0x49534c44, // "ISLD"
  oak: 0x4f414b21, // "OAK!"
} as const;
