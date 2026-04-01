/**
 * Biome System — Declarative Definitions + Placement Engine
 *
 * Biomes are data objects describing what appears and how it's arranged.
 * The engine interprets the schema to generate placement lists.
 *
 * Each object rule defines:
 *   - type: mesh type name (registered in MeshPool)
 *   - density: objects per 100 sq units
 *   - zone: 'back' | 'mid' | 'front' | 'all' — where in the scene
 *   - clustering: 0 (even) to 1 (tight groves)
 *   - clusterSize: objects per cluster (if clustering > 0)
 */

import { createRng } from '../core/random.js';

// ── Biome Definitions ──

export const BIOME_DEFS = {
  forest: {
    name: 'Forest',
    terrain: { amplitude: 1.5, frequency: 0.03 },
    palette: { ground: 0x3a5a2a, fog: 0x88aacc },
    objects: [
      { type: 'pineDark', density: 1.2, zone: 'back', clustering: 0.8, clusterSize: 8 },
      { type: 'pine', density: 0.8, zone: 'mid', clustering: 0.6, clusterSize: 5 },
      { type: 'deciduous', density: 0.5, zone: 'mid', clustering: 0.5, clusterSize: 4 },
      { type: 'deciduousLarge', density: 0.3, zone: 'front', clustering: 0.2, clusterSize: 2 },
      { type: 'bush', density: 0.8, zone: 'front', clustering: 0.3, clusterSize: 3 },
      { type: 'boulder', density: 0.15, zone: 'mid', clustering: 0.7, clusterSize: 4 },
      { type: 'cabin', density: 0.02, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'fence', density: 0.03, zone: 'mid', clustering: 0, clusterSize: 1 },
    ],
  },

  alpine: {
    name: 'Alpine',
    terrain: { amplitude: 2.5, frequency: 0.025 },
    palette: { ground: 0x556655, fog: 0x8899bb },
    objects: [
      { type: 'pine', density: 0.3, zone: 'mid', clustering: 0.5, clusterSize: 3 },
      { type: 'pineDark', density: 0.2, zone: 'back', clustering: 0.4, clusterSize: 3 },
      { type: 'boulder', density: 0.8, zone: 'all', clustering: 0.3, clusterSize: 3 },
      { type: 'boulderLarge', density: 0.2, zone: 'mid', clustering: 0.5, clusterSize: 2 },
      { type: 'windmill', density: 0.01, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'bush', density: 0.2, zone: 'front', clustering: 0.2, clusterSize: 2 },
    ],
  },

  meadow: {
    name: 'Meadow',
    terrain: { amplitude: 0.8, frequency: 0.02 },
    palette: { ground: 0x4a7a3a, fog: 0xaabbaa },
    objects: [
      { type: 'deciduous', density: 0.2, zone: 'back', clustering: 0.3, clusterSize: 3 },
      { type: 'pine', density: 0.15, zone: 'back', clustering: 0.2, clusterSize: 2 },
      { type: 'deciduousLarge', density: 0.08, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'bush', density: 1.0, zone: 'all', clustering: 0.4, clusterSize: 4 },
      { type: 'fence', density: 0.05, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'cabin', density: 0.02, zone: 'front', clustering: 0, clusterSize: 1 },
    ],
  },

  desert: {
    name: 'Desert',
    terrain: { amplitude: 0.6, frequency: 0.015 },
    palette: { ground: 0xc8b080, fog: 0xccaa77 },
    objects: [
      { type: 'cactus', density: 0.15, zone: 'all', clustering: 0, clusterSize: 1 },
      { type: 'deadTree', density: 0.08, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'rockArch', density: 0.02, zone: 'back', clustering: 0, clusterSize: 1 },
      { type: 'sandDune', density: 0.2, zone: 'all', clustering: 0.3, clusterSize: 2 },
      { type: 'boulder', density: 0.1, zone: 'mid', clustering: 0.5, clusterSize: 3 },
    ],
  },

  tundra: {
    name: 'Tundra',
    terrain: { amplitude: 0.5, frequency: 0.02 },
    palette: { ground: 0x889988, fog: 0xbbcccc },
    objects: [
      { type: 'snowPine', density: 0.2, zone: 'mid', clustering: 0.5, clusterSize: 3 },
      { type: 'snowPine', density: 0.1, zone: 'back', clustering: 0.3, clusterSize: 2 },
      { type: 'iceBoulder', density: 0.3, zone: 'all', clustering: 0.4, clusterSize: 3 },
      { type: 'boulder', density: 0.15, zone: 'front', clustering: 0.3, clusterSize: 2 },
      { type: 'bush', density: 0.1, zone: 'front', clustering: 0.2, clusterSize: 2 },
    ],
  },

  coast: {
    name: 'Coast',
    terrain: { amplitude: 0.4, frequency: 0.02 },
    palette: { ground: 0xc8b890, fog: 0x99aabb },
    objects: [
      { type: 'palm', density: 0.3, zone: 'mid', clustering: 0.5, clusterSize: 4 },
      { type: 'palm', density: 0.15, zone: 'front', clustering: 0.3, clusterSize: 2 },
      { type: 'driftwood', density: 0.2, zone: 'front', clustering: 0, clusterSize: 1 },
      { type: 'boulder', density: 0.1, zone: 'mid', clustering: 0.4, clusterSize: 3 },
      { type: 'lighthouse', density: 0.01, zone: 'back', clustering: 0, clusterSize: 1 },
      { type: 'bush', density: 0.3, zone: 'mid', clustering: 0.3, clusterSize: 3 },
    ],
  },

  swamp: {
    name: 'Swamp',
    terrain: { amplitude: 0.4, frequency: 0.02 },
    palette: { ground: 0x3a4a2a, fog: 0x556644 },
    objects: [
      { type: 'deadTree', density: 0.3, zone: 'back', clustering: 0.6, clusterSize: 4 },
      { type: 'bush', density: 1.0, zone: 'all', clustering: 0.3, clusterSize: 4 },
      { type: 'mushroom', density: 0.3, zone: 'mid', clustering: 0.5, clusterSize: 4 },
      { type: 'fern', density: 1.0, zone: 'front', clustering: 0.3, clusterSize: 4 },
      { type: 'boulder', density: 0.1, zone: 'mid', clustering: 0, clusterSize: 1 },
    ],
  },

  savanna: {
    name: 'Savanna',
    terrain: { amplitude: 0.6, frequency: 0.015 },
    palette: { ground: 0xb8a060, fog: 0xccaa77 },
    objects: [
      { type: 'acacia', density: 0.08, zone: 'all', clustering: 0, clusterSize: 1 },
      { type: 'tallGrass', density: 1.5, zone: 'all', clustering: 0.4, clusterSize: 5 },
      { type: 'bush', density: 0.4, zone: 'mid', clustering: 0.3, clusterSize: 3 },
      { type: 'boulder', density: 0.1, zone: 'mid', clustering: 0, clusterSize: 1 },
    ],
  },

  tropical: {
    name: 'Tropical',
    terrain: { amplitude: 1.0, frequency: 0.025 },
    palette: { ground: 0x2a7a2a, fog: 0x669988 },
    objects: [
      { type: 'palm', density: 0.6, zone: 'all', clustering: 0.5, clusterSize: 4 },
      { type: 'fern', density: 1.2, zone: 'all', clustering: 0.3, clusterSize: 4 },
      { type: 'deciduousLarge', density: 0.2, zone: 'mid', clustering: 0.4, clusterSize: 3 },
      { type: 'bush', density: 0.8, zone: 'front', clustering: 0.3, clusterSize: 3 },
    ],
  },

  volcanic: {
    name: 'Volcanic',
    terrain: { amplitude: 2.0, frequency: 0.03 },
    palette: { ground: 0x2a2020, fog: 0x554444 },
    objects: [
      { type: 'boulderLarge', density: 0.4, zone: 'all', clustering: 0.5, clusterSize: 3 },
      { type: 'deadTree', density: 0.15, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'boulder', density: 0.3, zone: 'all', clustering: 0.3, clusterSize: 3 },
    ],
  },

  autumn: {
    name: 'Autumn',
    terrain: { amplitude: 1.2, frequency: 0.025 },
    palette: { ground: 0x8a6a3a, fog: 0xbb9955 },
    objects: [
      { type: 'deciduousAutumn', density: 0.3, zone: 'back', clustering: 0.6, clusterSize: 5 },
      { type: 'deciduousAutumn', density: 0.2, zone: 'mid', clustering: 0.6, clusterSize: 4 },
      { type: 'deciduousLarge', density: 0.15, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'bush', density: 0.6, zone: 'front', clustering: 0.3, clusterSize: 3 },
      { type: 'mushroom', density: 0.2, zone: 'mid', clustering: 0.4, clusterSize: 3 },
      { type: 'fence', density: 0.03, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'cabin', density: 0.02, zone: 'front', clustering: 0, clusterSize: 1 },
    ],
  },

  wetland: {
    name: 'Wetland',
    terrain: { amplitude: 0.3, frequency: 0.015 },
    palette: { ground: 0x6a5a3a, fog: 0x99aa99 },
    objects: [
      { type: 'cattail', density: 0.8, zone: 'all', clustering: 0.5, clusterSize: 5 },
      { type: 'bush', density: 0.4, zone: 'mid', clustering: 0.3, clusterSize: 3 },
      { type: 'dock', density: 0.03, zone: 'front', clustering: 0, clusterSize: 1 },
      { type: 'boulder', density: 0.1, zone: 'mid', clustering: 0, clusterSize: 1 },
      { type: 'fern', density: 0.3, zone: 'front', clustering: 0.3, clusterSize: 3 },
    ],
  },
};

// ── Zone ranges (fraction of scene depth, 0 = far back, 1 = near front) ──
const ZONES = {
  back:  { minZ: 0.0, maxZ: 0.35 },
  mid:   { minZ: 0.25, maxZ: 0.7 },
  front: { minZ: 0.6, maxZ: 1.0 },
  all:   { minZ: 0.0, maxZ: 1.0 },
};

/**
 * Generate placements from a biome definition.
 *
 * @param {string} biomeName - Key in BIOME_DEFS
 * @param {string} seed
 * @param {number} sceneWidth - Total X extent
 * @param {number} sceneDepth - Total Z extent
 * @returns {{ placements: Array, terrain: object, palette: object }}
 */
export function generateBiome(biomeName, seed, sceneWidth = 80, sceneDepth = 80) {
  const def = BIOME_DEFS[biomeName] || BIOME_DEFS.forest;
  const rng = createRng(`${seed}-${biomeName}`);
  const placements = [];

  const halfW = sceneWidth / 2;
  const halfD = sceneDepth / 2;

  for (const rule of def.objects) {
    const zone = ZONES[rule.zone] || ZONES.all;
    const area = sceneWidth * sceneDepth * (zone.maxZ - zone.minZ);
    const count = Math.max(1, Math.round((area / 100) * rule.density));

    // Map zone fractions to world Z coordinates (negative = far, positive = near)
    const zMin = -halfD + zone.minZ * sceneDepth;
    const zMax = -halfD + zone.maxZ * sceneDepth;

    if (rule.clustering > 0.1 && count >= rule.clusterSize) {
      // Place as clusters
      const numClusters = Math.max(1, Math.round(count / rule.clusterSize));
      for (let c = 0; c < numClusters; c++) {
        const cx = rng.range(-halfW * 0.85, halfW * 0.85);
        const cz = rng.range(zMin, zMax);
        const radius = 3 + (1 - rule.clustering) * 8; // tighter clustering = smaller radius

        for (let i = 0; i < rule.clusterSize; i++) {
          const angle = rng.next() * Math.PI * 2;
          const dist = Math.abs(rng.gaussian(0, radius * 0.4));
          placements.push({
            type: rule.type,
            x: cx + Math.cos(angle) * dist,
            z: cz + Math.sin(angle) * dist,
            rotY: rng.next() * Math.PI * 2,
          });
        }
      }
    } else {
      // Place individually (even distribution)
      for (let i = 0; i < count; i++) {
        placements.push({
          type: rule.type,
          x: rng.range(-halfW * 0.9, halfW * 0.9),
          z: rng.range(zMin, zMax),
          rotY: rng.next() * Math.PI * 2,
        });
      }
    }
  }

  return {
    placements,
    terrain: def.terrain,
    palette: def.palette,
  };
}
