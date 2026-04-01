/**
 * Paper Theater — 3D Stage with Instanced Rendering
 *
 * Phase 1 architecture:
 *   - MeshPool for instanced batching (1 draw call per mesh type)
 *   - AnimationRegistry for centralized animation updates
 *   - Terrain displacement via noise
 *   - Declarative biome schema
 */

import './style.css';
import * as THREE from 'three';
import { Stage } from './stage/Stage.js';
import { MeshPool } from './stage/MeshPool.js';
import { AnimationRegistry } from './stage/AnimationRegistry.js';
import { registerAllTypes } from './stage/meshes.js';
import { generateBiome, BIOME_DEFS } from './stage/biomes.js';
import { createRng } from './core/random.js';
import { renderTypographic } from './core/typographic.js';
import { Clouds } from './stage/effects/Clouds.js';
import { Stars } from './stage/effects/Stars.js';

// ── State ──
let seed = 'hello';
let biome = 'forest';
let timeOfDay = 'day';
let textMode = false;

// ── Stage ──
const canvas = document.getElementById('stage');
const stage = new Stage(canvas, { pixelRatio: 0.75, maxFps: 30 });

// ── MeshPool ──
const pool = new MeshPool(stage.scene);
registerAllTypes(pool);

// ── Animation Registry ──
const animations = new AnimationRegistry();

// ── Effects ──
let clouds = null;
let stars = null;

// ── Text overlay ──
const textCanvas = document.getElementById('text-overlay');
const textCtx = textCanvas.getContext('2d');

function resizeTextCanvas() {
  textCanvas.width = window.innerWidth;
  textCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeTextCanvas);
resizeTextCanvas();

// ── Build scene ──
function buildScene() {
  pool.clear();
  animations.clear();
  stage.setTimeOfDay(timeOfDay);

  // Generate biome data
  const { placements, terrain, palette } = generateBiome(biome, seed);

  // Apply terrain displacement
  const terrainRng = createRng(`${seed}-terrain`);
  stage.displaceTerrain(terrainRng, terrain.amplitude, terrain.frequency);

  // Apply biome palette
  stage.ground.material.color.setHex(palette.ground);
  stage.scene.fog.color.setHex(palette.fog);
  stage.scene.background.setHex(palette.fog);

  // Batch all objects through MeshPool
  pool.beginBatch();

  for (const p of placements) {
    const pos = new THREE.Vector3(p.x, 0, p.z);
    // Snap to terrain height
    pos.y = stage.getTerrainHeight(p.x, p.z);
    pool.add(p.type, pos, p.rotY || 0);
  }

  const stats = pool.commitBatch();
  console.log(`[PaperTheater] Scene built: ${stats.instanceCount} objects, ${stats.drawCalls} draw calls`);

  // ── Wind sway for trees ──
  // Collect tree-type InstancedMeshes once per build (not per frame).
  const TREE_WIND = {
    pine:           { speed: 1.0,  amount: 0.03 },
    pineDark:       { speed: 0.9,  amount: 0.03 },
    deciduous:      { speed: 1.1,  amount: 0.04 },
    deciduousLarge: { speed: 0.8,  amount: 0.035 },
    bush:           { speed: 1.3,  amount: 0.02 },
    snowPine:       { speed: 0.95, amount: 0.025 },
    palm:           { speed: 1.2,  amount: 0.05 },
  };

  const swayTargets = [];
  stage.scene.traverse((obj) => {
    if (obj.isInstancedMesh && TREE_WIND[obj.userData.poolType]) {
      swayTargets.push({
        mesh: obj,
        wind: TREE_WIND[obj.userData.poolType],
      });
    }
  });

  // Temp objects reused every frame — allocated once, never GC'd.
  const _swayMat = new THREE.Matrix4();
  const _swayPos = new THREE.Vector3();
  const _swayQuat = new THREE.Quaternion();
  const _swayScale = new THREE.Vector3();
  const _swayEuler = new THREE.Euler();

  if (swayTargets.length > 0) {
    animations.register('windSway', (_dt, elapsed) => {
      for (const { mesh, wind } of swayTargets) {
        const count = mesh.count;
        for (let i = 0; i < count; i++) {
          mesh.getMatrixAt(i, _swayMat);
          _swayMat.decompose(_swayPos, _swayQuat, _swayScale);

          // Convert current quaternion to euler, add sway offset on Z axis,
          // then recompose. The per-instance phase offset (i * 0.5) prevents
          // all trees from swaying in lockstep.
          _swayEuler.setFromQuaternion(_swayQuat);
          _swayEuler.z = Math.sin(elapsed * wind.speed + i * 0.5) * wind.amount;

          _swayQuat.setFromEuler(_swayEuler);
          _swayMat.compose(_swayPos, _swayQuat, _swayScale);
          mesh.setMatrixAt(i, _swayMat);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    });
  }

  // ── Effects ──
  // Clean up previous effects
  if (clouds) clouds.dispose();
  if (stars) stars.dispose();

  // Clouds
  const cloudColors = { dawn: 0xddaa88, day: 0xffffff, dusk: 0xcc8855, night: 0x334455 };
  const cloudOpacity = { dawn: 0.4, day: 0.5, dusk: 0.4, night: 0.2 };
  clouds = new Clouds(stage.scene, {
    count: 50,
    color: cloudColors[timeOfDay] || 0xffffff,
    opacity: cloudOpacity[timeOfDay] || 0.5,
    speed: 0.8,
  });

  // Stars (visible at night and dusk)
  stars = new Stars(stage.scene);
  stars.setVisible(timeOfDay === 'night' || timeOfDay === 'dusk');

  // ── Register animations ──

  // Cloud drift
  animations.register('clouds', (dt) => clouds.update(dt));

  // Star twinkle
  animations.register('stars', (dt, elapsed) => stars.update(dt, elapsed));

  // Subtle camera sway for liveliness
  animations.register('cameraSway', (dt, elapsed) => {
    stage.camera.position.x = Math.sin(elapsed * 0.1) * 0.3;
    stage.camera.position.y = 8 + Math.sin(elapsed * 0.15) * 0.15;
  });
}

// ── Text overlay render ──
function renderText() {
  if (!textMode) return;

  const { pixels, width, height } = stage.readPixels();

  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');
  const imageData = offCtx.createImageData(width, height);

  // WebGL readPixels gives bottom-up, flip vertically
  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4;
    const dstRow = y * width * 4;
    for (let x = 0; x < width * 4; x++) {
      imageData.data[dstRow + x] = pixels[srcRow + x];
    }
  }
  offCtx.putImageData(imageData, 0, 0);

  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  renderTypographic(textCtx, offCtx, textCanvas.width, textCanvas.height, {
    font: '12px Georgia',
    lineHeight: 16,
    timeOfDay,
    seed,
    biome,
    bgColor: '#060608',
  });
}

// ── Animation loop ──
let lastTime = performance.now();

buildScene();
stage.start((now) => {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  animations.update(dt, now / 1000);

  // Text overlay (throttled)
  if (textMode && Math.floor(now / 300) % 2 === 0) {
    renderText();
  }
});

// ── Controls ──
const seedInput = document.getElementById('seed-input');
const biomeSelect = document.getElementById('biome-select');
const reseedBtn = document.getElementById('btn-reseed');

seedInput.value = seed;
biomeSelect.value = biome;

// Populate biome dropdown dynamically from definitions
biomeSelect.innerHTML = '';
for (const key of Object.keys(BIOME_DEFS)) {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = BIOME_DEFS[key].name;
  biomeSelect.appendChild(opt);
}
biomeSelect.value = biome;

seedInput.addEventListener('input', (e) => {
  seed = e.target.value || 'default';
  buildScene();
});

biomeSelect.addEventListener('change', (e) => {
  biome = e.target.value;
  buildScene();
});

reseedBtn.addEventListener('click', () => {
  seed = Math.random().toString(36).slice(2, 8);
  seedInput.value = seed;
  buildScene();
});

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.code === 'KeyT') {
    const times = ['dawn', 'day', 'dusk', 'night'];
    timeOfDay = times[(times.indexOf(timeOfDay) + 1) % times.length];
    window.paperTheater.setTime(timeOfDay);
  }
  if (e.code === 'KeyR') {
    textMode = !textMode;
    textCanvas.classList.toggle('active', textMode);
    canvas.classList.toggle('text-active', textMode);
    if (!textMode) textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  }
  if (e.code === 'Space') {
    e.preventDefault();
    seed = Math.random().toString(36).slice(2, 8);
    seedInput.value = seed;
    buildScene();
  }
});

// ── Debug API ──
window.paperTheater = {
  get state() {
    return { seed, biome, timeOfDay, textMode, pool: pool.getStats(), animations: animations.getStats() };
  },
  setSeed(s) { seed = s; seedInput.value = s; buildScene(); return `Seed: ${s}`; },
  setBiome(b) { biome = b; biomeSelect.value = b; buildScene(); return `Biome: ${b}`; },
  setTime(t) {
    timeOfDay = t;
    stage.setTimeOfDay(t);
    // Update effects for new time
    const cc = { dawn: 0xddaa88, day: 0xffffff, dusk: 0xcc8855, night: 0x334455 };
    const co = { dawn: 0.4, day: 0.5, dusk: 0.4, night: 0.2 };
    if (clouds) clouds.setStyle(cc[t] || 0xffffff, co[t] || 0.5);
    if (stars) stars.setVisible(t === 'night' || t === 'dusk');
    return `Time: ${t}`;
  },
  toggleText() {
    textMode = !textMode;
    textCanvas.classList.toggle('active', textMode);
    canvas.classList.toggle('text-active', textMode);
    if (!textMode) textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    return `Text ${textMode ? 'ON' : 'OFF'}`;
  },
  diagnose() {
    const s = pool.getStats();
    const a = animations.getStats();
    const report = `Paper Theater 3D\nDraw calls: ${s.drawCalls} (was 200+)\nObjects: ${s.totalObjects}\nRegistered types: ${s.registeredTypes}\nAnimations: ${a.procedural} procedural, ${a.mixers} mixers`;
    console.log(report);
    return report;
  },
};

console.log('[PaperTheater] 3D Stage ready. T=time, R=text, Space=reseed, D=diagnose');
