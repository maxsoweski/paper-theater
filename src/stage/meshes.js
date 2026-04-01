/**
 * Mesh Definitions — Geometry + Material templates for MeshPool instancing.
 *
 * Each definition is an array of "parts" — a compound object like a tree
 * is trunk + canopy, each part becomes its own InstancedMesh.
 *
 * Parts have: geometry, material, offset (relative to object origin), name.
 * The geometry is created ONCE and shared across all instances.
 */

import * as THREE from 'three';

// ── Shared materials (reused across types) ──
const mat = {
  trunk: new THREE.MeshLambertMaterial({ color: 0x5a3a1a }),
  trunkDark: new THREE.MeshLambertMaterial({ color: 0x3a2a15 }),
  greenDark: new THREE.MeshLambertMaterial({ color: 0x1a5a1a }),
  green: new THREE.MeshLambertMaterial({ color: 0x2a6a2a }),
  greenLight: new THREE.MeshLambertMaterial({ color: 0x3a8a3a }),
  greenBright: new THREE.MeshLambertMaterial({ color: 0x4a9a3a }),
  rock: new THREE.MeshLambertMaterial({ color: 0x777777 }),
  rockDark: new THREE.MeshLambertMaterial({ color: 0x555555 }),
  wood: new THREE.MeshLambertMaterial({ color: 0x8a6a4a }),
  roofBrown: new THREE.MeshLambertMaterial({ color: 0x5a3a2a }),
  stoneWall: new THREE.MeshLambertMaterial({ color: 0xccbbaa }),
  white: new THREE.MeshLambertMaterial({ color: 0xdddddd }),
  fence: new THREE.MeshLambertMaterial({ color: 0x8a7a5a }),
  chimney: new THREE.MeshLambertMaterial({ color: 0x555555 }),
  window: new THREE.MeshLambertMaterial({ color: 0xffeeaa, emissive: 0x554400, emissiveIntensity: 0.3 }),
  // Desert / arid
  cactus: new THREE.MeshLambertMaterial({ color: 0x3a7a3a }),
  sand: new THREE.MeshLambertMaterial({ color: 0xc8b080 }),
  bone: new THREE.MeshLambertMaterial({ color: 0xddccbb }),
  deadWood: new THREE.MeshLambertMaterial({ color: 0x6a5a4a }),
  // Coast
  palmTrunk: new THREE.MeshLambertMaterial({ color: 0x7a6040 }),
  palmLeaf: new THREE.MeshLambertMaterial({ color: 0x2a8a2a }),
  lighthouseWhite: new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
  lighthouseRed: new THREE.MeshLambertMaterial({ color: 0xcc3333 }),
  driftwood: new THREE.MeshLambertMaterial({ color: 0x9a8a7a }),
  // Tundra
  ice: new THREE.MeshLambertMaterial({ color: 0xaaccdd }),
  snowPine: new THREE.MeshLambertMaterial({ color: 0x1a4a3a }),
  // Savanna / swamp / wetland
  golden: new THREE.MeshLambertMaterial({ color: 0xc8a840 }),
  mushroomCap: new THREE.MeshLambertMaterial({ color: 0x993322 }),
  mushroomStem: new THREE.MeshLambertMaterial({ color: 0xccbbaa }),
  cattailHead: new THREE.MeshLambertMaterial({ color: 0x6a4a2a }),
  fernGreen: new THREE.MeshLambertMaterial({ color: 0x2a8a2a }),
  plank: new THREE.MeshLambertMaterial({ color: 0x8a7050 }),
  // Autumn
  autumnOrange: new THREE.MeshLambertMaterial({ color: 0xcc7722 }),
  autumnRed: new THREE.MeshLambertMaterial({ color: 0xaa3322 }),
};

// ── Geometry factories (called once, cached) ──

function pineCanopyGeo(tierIndex, height = 3) {
  const tierH = height * 0.35;
  const tierR = height * (0.35 - tierIndex * 0.08);
  return new THREE.ConeGeometry(tierR, tierH, 6);
}

function distortedIcosahedron(radius, detail = 1, seed = 42) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  let r = seed;
  for (let i = 0; i < pos.count; i++) {
    r = (r * 16807) % 2147483647; // LCG for deterministic distortion
    const f = 0.7 + (r / 2147483647) * 0.6;
    pos.setX(i, pos.getX(i) * f);
    r = (r * 16807) % 2147483647;
    pos.setY(i, pos.getY(i) * (0.5 + (r / 2147483647) * 0.5));
    r = (r * 16807) % 2147483647;
    pos.setZ(i, pos.getZ(i) * (0.7 + (r / 2147483647) * 0.6));
  }
  geo.computeVertexNormals();
  return geo;
}

// ── Type Definitions ──
// Each returns an array of { geometry, material, offset, name }

export function definePine() {
  const h = 3;
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, h * 0.25, 5);
  const parts = [
    { geometry: trunkGeo, material: mat.trunk, offset: new THREE.Vector3(0, h * 0.125, 0), name: 'trunk' },
  ];
  for (let i = 0; i < 3; i++) {
    const geo = pineCanopyGeo(i, h);
    const y = h * 0.25 + i * (h * 0.35) * 0.55 + (h * 0.35) * 0.5;
    parts.push({ geometry: geo, material: mat.green, offset: new THREE.Vector3(0, y, 0), name: `canopy${i}` });
  }
  return parts;
}

export function definePineDark() {
  const h = 3;
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, h * 0.25, 5);
  const parts = [
    { geometry: trunkGeo, material: mat.trunkDark, offset: new THREE.Vector3(0, h * 0.125, 0), name: 'trunk' },
  ];
  for (let i = 0; i < 3; i++) {
    const geo = pineCanopyGeo(i, h);
    const y = h * 0.25 + i * (h * 0.35) * 0.55 + (h * 0.35) * 0.5;
    parts.push({ geometry: geo, material: mat.greenDark, offset: new THREE.Vector3(0, y, 0), name: `canopy${i}` });
  }
  return parts;
}

export function defineDeciduous() {
  const h = 3.5;
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.16, h * 0.4, 5);
  const crownGeo = new THREE.IcosahedronGeometry(h * 0.35, 1);
  return [
    { geometry: trunkGeo, material: mat.trunk, offset: new THREE.Vector3(0, h * 0.2, 0), name: 'trunk' },
    { geometry: crownGeo, material: mat.greenLight, offset: new THREE.Vector3(0, h * 0.55, 0), name: 'crown' },
  ];
}

export function defineDeciduousLarge() {
  const h = 5;
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.22, h * 0.4, 6);
  const crownGeo = new THREE.IcosahedronGeometry(h * 0.32, 1);
  return [
    { geometry: trunkGeo, material: mat.trunk, offset: new THREE.Vector3(0, h * 0.2, 0), name: 'trunk' },
    { geometry: crownGeo, material: mat.greenBright, offset: new THREE.Vector3(0, h * 0.55, 0), name: 'crown' },
  ];
}

export function defineBush() {
  const geo = new THREE.IcosahedronGeometry(0.6, 1);
  geo.scale(1, 0.6, 1);
  return [
    { geometry: geo, material: mat.green, offset: new THREE.Vector3(0, 0.3, 0), name: 'bush' },
  ];
}

export function defineBoulder() {
  const geo = distortedIcosahedron(0.5, 1, 42);
  return [
    { geometry: geo, material: mat.rock, offset: new THREE.Vector3(0, 0.2, 0), name: 'boulder' },
  ];
}

export function defineBoulderLarge() {
  const geo = distortedIcosahedron(1.0, 1, 99);
  return [
    { geometry: geo, material: mat.rockDark, offset: new THREE.Vector3(0, 0.4, 0), name: 'boulder' },
  ];
}

export function defineCabin() {
  const wallGeo = new THREE.BoxGeometry(2, 1.5, 1.5);
  const roofGeo = new THREE.ConeGeometry(1.6, 1.0, 4);
  roofGeo.rotateY(Math.PI / 4);
  const chimGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
  return [
    { geometry: wallGeo, material: mat.wood, offset: new THREE.Vector3(0, 0.75, 0), name: 'walls' },
    { geometry: roofGeo, material: mat.roofBrown, offset: new THREE.Vector3(0, 2.0, 0), name: 'roof' },
    { geometry: chimGeo, material: mat.chimney, offset: new THREE.Vector3(0.5, 2.3, 0), name: 'chimney' },
  ];
}

export function defineWindmill() {
  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.7, 4, 6);
  const capGeo = new THREE.ConeGeometry(0.5, 0.6, 6);
  // Blades as a single cross geometry
  const bladesGeo = new THREE.BufferGeometry();
  const bladePositions = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    // Each blade: thin quad from center outward
    const len = 2.5, w = 0.15;
    const bx = cos * len, by = sin * len;
    // Two triangles per blade
    bladePositions.push(
      -sin * w, cos * w, 0, cos * len, sin * len, 0, sin * w, -cos * w, 0,
      sin * w, -cos * w, 0, cos * len, sin * len, 0, -sin * w + cos * len, cos * w + sin * len, 0
    );
  }
  bladesGeo.setAttribute('position', new THREE.Float32BufferAttribute(bladePositions, 3));
  bladesGeo.computeVertexNormals();

  return [
    { geometry: bodyGeo, material: mat.stoneWall, offset: new THREE.Vector3(0, 2, 0), name: 'body' },
    { geometry: capGeo, material: mat.roofBrown, offset: new THREE.Vector3(0, 4.3, 0), name: 'cap' },
    { geometry: bladesGeo, material: mat.white, offset: new THREE.Vector3(0, 4.0, 0.5), name: 'blades' },
  ];
}

export function defineFence() {
  // Bake posts + rails into one geometry for efficiency
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const length = 4;
  const posts = 4;

  // Helper: add box vertices (simplified — axis-aligned)
  function addBox(cx, cy, cz, hw, hh, hd) {
    const x0 = cx - hw, x1 = cx + hw;
    const y0 = cy - hh, y1 = cy + hh;
    const z0 = cz - hd, z1 = cz + hd;
    // 6 faces × 2 triangles × 3 vertices = 36 values per face... just use BoxGeometry merge
    // Actually, let's use a merged approach
  }

  // Simpler: create individual BoxGeometry and merge
  const merged = new THREE.BoxGeometry(0); // empty, we'll replace
  const postGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
  const railGeo = new THREE.BoxGeometry(length, 0.06, 0.06);

  // For simplicity with instancing, fence is just one flat box representing the whole thing
  const fenceGeo = new THREE.BoxGeometry(length, 0.8, 0.1);
  return [
    { geometry: fenceGeo, material: mat.fence, offset: new THREE.Vector3(0, 0.4, 0), name: 'fence' },
  ];
}

// ── Desert objects ──

export function defineCactus() {
  // Saguaro-style: tall cylinder + two arm branches
  const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 3, 6);
  const armGeo = new THREE.CylinderGeometry(0.15, 0.18, 1.2, 5);
  armGeo.rotateZ(Math.PI / 3);
  const armGeo2 = new THREE.CylinderGeometry(0.15, 0.18, 1.0, 5);
  armGeo2.rotateZ(-Math.PI / 3.5);
  return [
    { geometry: bodyGeo, material: mat.cactus, offset: new THREE.Vector3(0, 1.5, 0), name: 'body' },
    { geometry: armGeo, material: mat.cactus, offset: new THREE.Vector3(-0.5, 1.8, 0), name: 'armL' },
    { geometry: armGeo2, material: mat.cactus, offset: new THREE.Vector3(0.5, 1.4, 0), name: 'armR' },
  ];
}

export function defineDeadTree() {
  // Bare trunk with two angular branches
  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.15, 2.5, 5);
  const branchGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.2, 4);
  branchGeo.rotateZ(Math.PI / 4);
  const branchGeo2 = new THREE.CylinderGeometry(0.04, 0.06, 0.9, 4);
  branchGeo2.rotateZ(-Math.PI / 3);
  return [
    { geometry: trunkGeo, material: mat.deadWood, offset: new THREE.Vector3(0, 1.25, 0), name: 'trunk' },
    { geometry: branchGeo, material: mat.deadWood, offset: new THREE.Vector3(-0.4, 1.8, 0), name: 'branchL' },
    { geometry: branchGeo2, material: mat.deadWood, offset: new THREE.Vector3(0.3, 2.0, 0), name: 'branchR' },
  ];
}

export function defineRockArch() {
  // Two pillar boulders + a slab on top
  const pillarGeo = distortedIcosahedron(0.6, 1, 77);
  pillarGeo.scale(0.6, 1.5, 0.6);
  const slabGeo = new THREE.BoxGeometry(2.5, 0.4, 0.8);
  return [
    { geometry: pillarGeo, material: mat.sand, offset: new THREE.Vector3(-0.9, 0.8, 0), name: 'pillarL' },
    { geometry: pillarGeo, material: mat.sand, offset: new THREE.Vector3(0.9, 0.8, 0), name: 'pillarR' },
    { geometry: slabGeo, material: mat.sand, offset: new THREE.Vector3(0, 1.8, 0), name: 'slab' },
  ];
}

export function defineSandDune() {
  // Flattened, stretched sphere
  const geo = new THREE.SphereGeometry(2, 8, 4);
  geo.scale(1, 0.2, 0.6);
  return [
    { geometry: geo, material: mat.sand, offset: new THREE.Vector3(0, 0.1, 0), name: 'dune' },
  ];
}

// ── Coast objects ──

export function definePalm() {
  // Curved trunk (slight lean) + fan of leaf planes
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.18, 4, 6);
  // Leaf cluster as a squished icosahedron (approximates fan shape)
  const leafGeo = new THREE.IcosahedronGeometry(1.2, 1);
  leafGeo.scale(1, 0.4, 1);
  return [
    { geometry: trunkGeo, material: mat.palmTrunk, offset: new THREE.Vector3(0.2, 2, 0), name: 'trunk' },
    { geometry: leafGeo, material: mat.palmLeaf, offset: new THREE.Vector3(0.3, 4.2, 0), name: 'leaves' },
  ];
}

export function defineLighthouse() {
  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.6, 5, 8);
  const capGeo = new THREE.ConeGeometry(0.55, 0.8, 8);
  // Red stripe as a ring
  const stripeGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.6, 8);
  return [
    { geometry: bodyGeo, material: mat.lighthouseWhite, offset: new THREE.Vector3(0, 2.5, 0), name: 'body' },
    { geometry: stripeGeo, material: mat.lighthouseRed, offset: new THREE.Vector3(0, 3.5, 0), name: 'stripe' },
    { geometry: capGeo, material: mat.roofBrown, offset: new THREE.Vector3(0, 5.4, 0), name: 'cap' },
  ];
}

export function defineDriftwood() {
  const geo = new THREE.CylinderGeometry(0.08, 0.12, 2.5, 5);
  geo.rotateZ(Math.PI / 8);
  return [
    { geometry: geo, material: mat.driftwood, offset: new THREE.Vector3(0, 0.15, 0), name: 'log' },
  ];
}

// ── Tundra objects ──

export function defineSnowPine() {
  const h = 2.2;
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.14, h * 0.3, 5);
  const parts = [
    { geometry: trunkGeo, material: mat.trunkDark, offset: new THREE.Vector3(0, h * 0.15, 0), name: 'trunk' },
  ];
  for (let i = 0; i < 2; i++) {
    const geo = new THREE.ConeGeometry(h * (0.3 - i * 0.06), h * 0.4, 6);
    const y = h * 0.3 + i * h * 0.28 + h * 0.2;
    parts.push({ geometry: geo, material: mat.snowPine, offset: new THREE.Vector3(0, y, 0), name: `canopy${i}` });
  }
  return parts;
}

export function defineIceBoulder() {
  const geo = distortedIcosahedron(0.7, 1, 55);
  return [
    { geometry: geo, material: mat.ice, offset: new THREE.Vector3(0, 0.3, 0), name: 'ice' },
  ];
}

// ── Savanna / swamp / wetland / autumn objects ──

export function defineAcacia() {
  const h = 5;
  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.14, h * 0.6, 5);
  const canopyGeo = new THREE.IcosahedronGeometry(1.8, 1);
  canopyGeo.scale(1.5, 0.3, 1.5); // wide flat canopy
  return [
    { geometry: trunkGeo, material: mat.trunk, offset: new THREE.Vector3(0, h * 0.3, 0), name: 'trunk' },
    { geometry: canopyGeo, material: mat.greenDark, offset: new THREE.Vector3(0, h * 0.65, 0), name: 'canopy' },
  ];
}

export function defineTallGrass() {
  const stalk1 = new THREE.CylinderGeometry(0.02, 0.03, 1.2, 4);
  const stalk2 = new THREE.CylinderGeometry(0.02, 0.03, 1.0, 4);
  stalk2.rotateZ(0.15);
  const stalk3 = new THREE.CylinderGeometry(0.02, 0.03, 1.1, 4);
  stalk3.rotateZ(-0.12);
  return [
    { geometry: stalk1, material: mat.golden, offset: new THREE.Vector3(0, 0.6, 0), name: 'stalk1' },
    { geometry: stalk2, material: mat.golden, offset: new THREE.Vector3(0.08, 0.5, 0.05), name: 'stalk2' },
    { geometry: stalk3, material: mat.golden, offset: new THREE.Vector3(-0.06, 0.55, -0.04), name: 'stalk3' },
  ];
}

export function defineMushroom() {
  const stemGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.4, 5);
  const capGeo = new THREE.SphereGeometry(0.35, 8, 6);
  capGeo.scale(1, 0.5, 1);
  return [
    { geometry: stemGeo, material: mat.mushroomStem, offset: new THREE.Vector3(0, 0.2, 0), name: 'stem' },
    { geometry: capGeo, material: mat.mushroomCap, offset: new THREE.Vector3(0, 0.5, 0), name: 'cap' },
  ];
}

export function defineCattail() {
  const stalkGeo = new THREE.CylinderGeometry(0.02, 0.03, 2.0, 4);
  const headGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 5);
  return [
    { geometry: stalkGeo, material: mat.fernGreen, offset: new THREE.Vector3(0, 1.0, 0), name: 'stalk' },
    { geometry: headGeo, material: mat.cattailHead, offset: new THREE.Vector3(0, 2.1, 0), name: 'head' },
  ];
}

export function defineFern() {
  const geo = new THREE.IcosahedronGeometry(0.5, 1);
  geo.scale(1, 0.4, 1);
  return [
    { geometry: geo, material: mat.fernGreen, offset: new THREE.Vector3(0, 0.15, 0), name: 'fern' },
  ];
}

export function defineDock() {
  const plankGeo = new THREE.BoxGeometry(3, 0.1, 1.2);
  return [
    { geometry: plankGeo, material: mat.plank, offset: new THREE.Vector3(0, 0.15, 0), name: 'plank' },
  ];
}

export function defineHayBale() {
  const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 8);
  geo.rotateZ(Math.PI / 2);
  return [
    { geometry: geo, material: mat.golden, offset: new THREE.Vector3(0, 0.5, 0), name: 'bale' },
  ];
}

export function defineDeciduousAutumn() {
  const h = 3.5;
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.16, h * 0.4, 5);
  const crownGeo = new THREE.IcosahedronGeometry(h * 0.35, 1);
  return [
    { geometry: trunkGeo, material: mat.trunk, offset: new THREE.Vector3(0, h * 0.2, 0), name: 'trunk' },
    { geometry: crownGeo, material: mat.autumnOrange, offset: new THREE.Vector3(0, h * 0.55, 0), name: 'crown' },
  ];
}

/**
 * Register all mesh types with a MeshPool.
 */
export function registerAllTypes(pool) {
  pool.registerType('pine', definePine());
  pool.registerType('pineDark', definePineDark());
  pool.registerType('deciduous', defineDeciduous());
  pool.registerType('deciduousLarge', defineDeciduousLarge());
  pool.registerType('bush', defineBush());
  pool.registerType('boulder', defineBoulder());
  pool.registerType('boulderLarge', defineBoulderLarge());
  pool.registerType('cabin', defineCabin());
  pool.registerType('windmill', defineWindmill());
  pool.registerType('fence', defineFence());
  // Desert
  pool.registerType('cactus', defineCactus());
  pool.registerType('deadTree', defineDeadTree());
  pool.registerType('rockArch', defineRockArch());
  pool.registerType('sandDune', defineSandDune());
  // Coast
  pool.registerType('palm', definePalm());
  pool.registerType('lighthouse', defineLighthouse());
  pool.registerType('driftwood', defineDriftwood());
  // Tundra
  pool.registerType('snowPine', defineSnowPine());
  pool.registerType('iceBoulder', defineIceBoulder());
  // Savanna / swamp / wetland / autumn
  pool.registerType('acacia', defineAcacia());
  pool.registerType('tallGrass', defineTallGrass());
  pool.registerType('mushroom', defineMushroom());
  pool.registerType('cattail', defineCattail());
  pool.registerType('fern', defineFern());
  pool.registerType('dock', defineDock());
  pool.registerType('hayBale', defineHayBale());
  pool.registerType('deciduousAutumn', defineDeciduousAutumn());
}
