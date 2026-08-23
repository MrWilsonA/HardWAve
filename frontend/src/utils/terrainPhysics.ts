/**
 * Precise Terrain Physics & Island Layout
 * - Solid, uniform ground height across the entire island (no flying or launching).
 * - Clean separation of land, roads, ponds, and cottages.
 * - Helpers for grass/prop placement filters.
 */

export interface Obstacle {
  x: number;
  z: number;
  radius: number;
}

export const OBSTACLES: Obstacle[] = [
  // Grand Oak centerpiece (enlarged majestic trunk)
  { x: 0, z: 0, radius: 2.8 },     // Central Grand Oak trunk & flared roots
  // Pavilions (radius 4.5)
  { x: -16, z: -16, radius: 4.2 }, // GPU Lab
  { x: 20, z: -16, radius: 4.2 },  // Blockchain Vault
  { x: -18, z: 18, radius: 4.2 },  // Service Workshop
  { x: 0, z: -25, radius: 4.0 },   // QR Gate
  { x: 22, z: 18, radius: 4.2 },   // Showroom
  // Outer Ring Houses (radius ~35 to 37)
  { x: -26, z: -26, radius: 3.2 }, // NW TwoStoryVilla
  { x: -35, z: 0, radius: 2.6 },   // West SmallCottage
  { x: -26, z: 26, radius: 3.0 },  // SW MediumFarmhouse
  { x: 0, z: 36, radius: 3.4 },    // South TwoStoryVilla
  { x: 26, z: 26, radius: 3.0 },   // SE AlpineChalet
  { x: 36, z: -4, radius: 3.0 },   // East MediumFarmhouse
  { x: 26, z: -26, radius: 2.6 },  // NE SmallCottage
  { x: 0, z: -36, radius: 3.2 },   // North TwoStoryVilla
];

/**
 * Checks if a coordinate is on the road network (no grass or trees should spawn here).
 * Generous buffer margins prevent any grass clipping through road edges.
 */
export function isOnRoad(x: number, z: number): boolean {
  const dist = Math.sqrt(x * x + z * z);

  // Central Rotary Roundabout (radius 6.5)
  if (dist < 6.8) return true;

  // Grand Ring Boulevard (radius ~21.2 to 28.8)
  if (dist >= 21.0 && dist <= 29.0) return true;

  // Central Cross Roads (East-West & North-South, width 4.0 with buffer)
  if (Math.abs(z) <= 2.2 && Math.abs(x) <= 31) return true;
  if (Math.abs(x) <= 2.2 && Math.abs(z) <= 31) return true;

  // Diagonal Spoke Roads
  if (Math.abs(x - z) <= 2.2 && dist <= 29) return true;
  if (Math.abs(x + z) <= 2.2 && dist <= 29) return true;

  // Wooden Bridge across Lake (East-West road: x: 9.5 to 18.5, z: -2.2 to 2.2)
  if (x >= 9.0 && x <= 19.0 && Math.abs(z) <= 2.2) return true;

  return false;
}

/**
 * Checks if a coordinate is in a water body.
 */
export function isInWater(x: number, z: number): boolean {
  // Main Lake (center: 14, 0, radius: 6.0)
  const distLake = Math.sqrt((x - 14) ** 2 + z ** 2);
  if (distLake <= 6.2) {
    // If on bridge (East-West road), it's bridge road, not water
    const onBridge = x >= 9.5 && x <= 18.5 && Math.abs(z) <= 1.9;
    return !onBridge;
  }

  return false;
}

/**
 * Returns exact terrain height at (x, z).
 * Solid, completely stable and continuous ground: no flying, no launching!
 */
export function getTerrainHeight(x: number, z: number): number {
  const dist = Math.sqrt(x * x + z * z);

  // Outer ocean drop-off (smooth beach slope into ocean)
  if (dist > 52) return -1.5;
  if (dist > 44) return 0.20 - (dist - 44) * 0.22;

  // Wooden Bridge across East Lake (x: 9.5 to 18.5, z: -2.0 to 2.0)
  if (x >= 9.5 && x <= 18.5 && Math.abs(z) <= 1.9) {
    return 0.38; // Elevated bridge deck
  }

  // Main East Lake (x: 14, z: 0, radius: 6.0)
  const distLake = Math.sqrt((x - 14) ** 2 + z ** 2);
  if (distLake < 6.0) {
    return -0.8 + (distLake / 6.0) * 0.95; // Smooth lake basin
  }

  // Roads are elevated at y = 0.25 (proudly above lawn ground y = 0.20)
  if (isOnRoad(x, z)) {
    return 0.25;
  }

  // Solid, flat green grass ground: y = 0.20
  return 0.20;
}

/**
 * Resolves obstacle and water collision, returning adjusted horizontal position.
 */
export function resolveObstacleCollision(
  posX: number,
  posZ: number,
  vehicleRadius: number = 1.2
): { x: number; z: number; collided: boolean } {
  let x = posX;
  let z = posZ;
  let collided = false;

  // Obstacles (buildings, pavilions, Grand Oak trunk)
  for (const obs of OBSTACLES) {
    const dx = x - obs.x;
    const dz = z - obs.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minDist = obs.radius + vehicleRadius;

    if (dist < minDist && dist > 0.001) {
      const overlap = minDist - dist;
      x += (dx / dist) * overlap;
      z += (dz / dist) * overlap;
      collided = true;
    }
  }

  // Water boundary protection (stop car from driving into deep lake)
  const onBridge = x >= 9.5 && x <= 18.5 && Math.abs(z) <= 1.9;
  const distLake = Math.sqrt((x - 14) ** 2 + z ** 2);
  if (distLake < 5.8 && !onBridge) {
    const pushAngle = Math.atan2(z, x - 14);
    x = 14 + Math.cos(pushAngle) * 6.0;
    z = Math.sin(pushAngle) * 6.0;
    collided = true;
  }

  return { x, z, collided };
}
