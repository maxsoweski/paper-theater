#!/usr/bin/env node
/**
 * CLI test script for the Paper Theater generation pipeline.
 *
 * Validates terrain generation, color calculation, and scene composition
 * without needing a browser. Claude can run this directly via Bash.
 *
 * Usage: node scripts/test-generation.js [seed] [layers] [width] [height]
 */

import { createRng } from '../src/core/random.js';
import { fbmProfile, midpointProfile } from '../src/core/noise.js';
import { generateProfile, lowPolyShape } from '../src/core/terrain.js';
import { generateLayerPalette, applyAtmosphere } from '../src/core/color.js';
import { validateProfile, validateScene, formatReport } from '../src/debug/validate.js';

const seed = process.argv[2] || 'test';
const layerCount = parseInt(process.argv[3]) || 6;
const width = parseInt(process.argv[4]) || 800;
const height = parseInt(process.argv[5]) || 600;

console.log('═══ Paper Theater Generation Test ═══');
console.log(`Seed: "${seed}" | Layers: ${layerCount} | Canvas: ${width}x${height}`);
console.log('');

// ── Test 1: RNG determinism ──
console.log('── Test 1: RNG Determinism ──');
const rng1 = createRng('determinism-test');
const rng2 = createRng('determinism-test');
const vals1 = Array.from({ length: 5 }, () => rng1.next());
const vals2 = Array.from({ length: 5 }, () => rng2.next());
const rngMatch = vals1.every((v, i) => v === vals2[i]);
console.log(`Same seed produces same sequence: ${rngMatch ? '✓ PASS' : '✗ FAIL'}`);
if (!rngMatch) {
  console.log('  Expected:', vals1);
  console.log('  Got:     ', vals2);
}

// ── Test 2: FBM profile ──
console.log('\n── Test 2: FBM Profile ──');
const fbmRng = createRng(`${seed}-fbm`);
const fbm = fbmProfile(fbmRng, width, { octaves: 5, baseWavelength: 128 });
const fbmValid = validateProfile(fbm, height, 0);
console.log(`FBM profile (${fbm.length} pts): ${fbmValid.ok ? '✓ PASS' : '✗ FAIL'}`);
console.log(`  Range: [${fbmValid.stats.min}, ${fbmValid.stats.max}], Avg: ${fbmValid.stats.avg}`);
if (!fbmValid.ok) fbmValid.issues.forEach(i => console.log(`  ✗ ${i}`));

// ── Test 3: Midpoint profile ──
console.log('\n── Test 3: Midpoint Profile ──');
const mpRng = createRng(`${seed}-midpoint`);
const mp = midpointProfile(mpRng, width, 0.5);
// Midpoint produces [0,1], scale to canvas
const mpScaled = new Float32Array(mp.length);
for (let i = 0; i < mp.length; i++) mpScaled[i] = mp[i] * height;
const mpValid = validateProfile(mpScaled, height, 0);
console.log(`Midpoint profile (${mp.length} pts): ${mpValid.ok ? '✓ PASS' : '✗ FAIL'}`);
console.log(`  Range: [${mpValid.stats.min}, ${mpValid.stats.max}], Avg: ${mpValid.stats.avg}`);
if (!mpValid.ok) mpValid.issues.forEach(i => console.log(`  ✗ ${i}`));

// ── Test 4: Low-poly shape function ──
console.log('\n── Test 4: Low-Poly Shape ──');
const shape = lowPolyShape(20);
const quantized = shape(153.7, 0, width, height);
const stepCorrect = quantized === 160; // round(153.7/20)*20 = 160
console.log(`lowPolyShape(20) on 153.7 → ${quantized}: ${stepCorrect ? '✓ PASS' : '✗ FAIL'}`);

// ── Test 5: Atmospheric perspective palette ──
console.log('\n── Test 5: Atmospheric Palette ──');
const baseColor = [40, 60, 35];
const atmoColor = [180, 200, 230];
const palette = generateLayerPalette(baseColor, atmoColor, layerCount, 0.75);
console.log(`Generated ${palette.length} layer colors:`);
for (let i = 0; i < palette.length; i++) {
  const [r, g, b] = palette[i];
  const depth = i / Math.max(1, layerCount - 1);
  console.log(`  L${i} (d=${depth.toFixed(2)}): rgb(${r}, ${g}, ${b})`);
}
// Check: first color should be closest to atmosphere, last should be closest to base
const firstDist = Math.abs(palette[0][0] - atmoColor[0]) + Math.abs(palette[0][1] - atmoColor[1]) + Math.abs(palette[0][2] - atmoColor[2]);
const lastDist = Math.abs(palette[layerCount - 1][0] - baseColor[0]) + Math.abs(palette[layerCount - 1][1] - baseColor[1]) + Math.abs(palette[layerCount - 1][2] - baseColor[2]);
console.log(`  Far layer blends toward atmosphere: ${firstDist < 200 ? '✓ PASS' : '✗ FAIL'} (dist=${firstDist}, <200 expected)`);
console.log(`  Near layer near base color: ${lastDist < 50 ? '✓ PASS' : '✗ FAIL'} (dist=${lastDist})`);

// ── Test 6: Full scene generation + validation ──
console.log('\n── Test 6: Full Scene Validation ──');
const layers = [];
for (let i = 0; i < layerCount; i++) {
  const t = i / Math.max(1, layerCount - 1);
  const profile = generateProfile({
    seed,
    depth: t,
    width,
    canvasHeight: height,
    baseHeight: 0.35 + t * 0.35,
    amplitude: 0.08 + (1 - t) * 0.15,
    roughness: 0.3 + t * 0.35,
    wavelength: 200 - t * 120,
    shape: lowPolyShape(30 - t * 22),
  });
  layers.push({ profile, color: palette[i], depth: t });
}

const sceneValidation = validateScene(layers, width, height);
console.log(formatReport(sceneValidation));

// ── ASCII visualization of profiles ──
console.log('\n── Profile ASCII Preview ──');
const previewW = 60;
const previewH = 20;
const grid = Array.from({ length: previewH }, () => Array(previewW).fill(' '));

for (let li = 0; li < layers.length; li++) {
  const profile = layers[li].profile;
  const char = String(li);
  for (let px = 0; px < previewW; px++) {
    const srcX = Math.floor((px / previewW) * profile.length);
    const srcY = profile[srcX];
    const gridY = Math.floor((srcY / height) * previewH);
    if (gridY >= 0 && gridY < previewH) {
      // Fill from profile to bottom
      for (let gy = gridY; gy < previewH; gy++) {
        grid[gy][px] = char;
      }
    }
  }
}

for (const row of grid) {
  console.log('  |' + row.join('') + '|');
}
console.log('  ' + '+' + '-'.repeat(previewW) + '+');
console.log('  Digits = layer index (0=farthest, ' + (layerCount - 1) + '=nearest)');

// ── Summary ──
console.log('\n═══ Summary ═══');
const allPassed = rngMatch && fbmValid.ok && mpValid.ok && stepCorrect && sceneValidation.ok;
console.log(`Overall: ${allPassed ? '✓ ALL TESTS PASS' : '✗ SOME TESTS FAILED'}`);
process.exit(allPassed ? 0 : 1);
