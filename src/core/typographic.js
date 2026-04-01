/**
 * Typographic Renderer — Scene-Shaped Text
 *
 * The text FORMS the landscape. Words appear where objects are in the scene,
 * shaped by the 3D render's brightness and color data. Dense tree-words
 * where trees are, sparse sky-words in the sky, ground-words on the ground.
 *
 * Pipeline:
 *   1. Sample the 3D render (srcCtx) at its native resolution
 *   2. Compute interest map (edge contrast → where objects are)
 *   3. Place words on the output canvas, scaled to output dimensions
 *   4. Word choice, density, color, and size all driven by the sampled data
 */

import { classifyRegion, getContextualWord } from './contextual-words.js';
import { createRng } from './random.js';

/**
 * Render contextual words shaped by the 3D scene.
 *
 * @param {CanvasRenderingContext2D} ctx - Output text canvas
 * @param {CanvasRenderingContext2D} srcCtx - Source 3D render (may be smaller)
 * @param {number} srcW - Source canvas width (readPixels size)
 * @param {number} srcH - Source canvas height
 * @param {number} outW - Output canvas width (display size)
 * @param {number} outH - Output canvas height
 * @param {object} opts
 */
export function renderTypographic(ctx, srcCtx, srcW, srcH, outW, outH, opts = {}) {
  const {
    font = '11px Georgia',
    lineHeight = 14,
    bgColor = '#060608',
    timeOfDay = 'day',
    seed = 'default',
    biome = 'forest',
  } = opts;

  // ── Sample source at its native resolution ──
  const imageData = srcCtx.getImageData(0, 0, srcW, srcH);
  const px = imageData.data;

  // Build a lookup: (outX, outY) → source pixel
  // Scale factor from output coords to source coords
  const scaleX = srcW / outW;
  const scaleY = srcH / outH;

  function sampleAt(outX, outY) {
    const sx = Math.min(Math.floor(outX * scaleX), srcW - 1);
    const sy = Math.min(Math.floor(outY * scaleY), srcH - 1);
    const idx = (sy * srcW + sx) * 4;
    return {
      r: px[idx],
      g: px[idx + 1],
      b: px[idx + 2],
      lum: (0.299 * px[idx] + 0.587 * px[idx + 1] + 0.114 * px[idx + 2]) / 255,
    };
  }

  // Compute interest (edge contrast) at a point by comparing to neighbors
  function interestAt(outX, outY) {
    const c = sampleAt(outX, outY);
    const step = 8;
    let diff = 0;
    let count = 0;
    for (const [dx, dy] of [[-step, 0], [step, 0], [0, -step], [0, step]]) {
      const nx = outX + dx, ny = outY + dy;
      if (nx >= 0 && nx < outW && ny >= 0 && ny < outH) {
        const n = sampleAt(nx, ny);
        diff += Math.abs(c.lum - n.lum);
        count++;
      }
    }
    return Math.min(1, c.lum * 0.5 + (diff / count) * 6);
  }

  // ── Background ──
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, outW, outH);

  ctx.textBaseline = 'top';

  const wordRng = createRng(`${seed}-words`);
  const rows = Math.floor(outH / lineHeight);

  for (let row = 0; row < rows; row++) {
    const y = row * lineHeight;
    let x = 2;

    while (x < outW - 2) {
      const s = sampleAt(x, y + lineHeight / 2);
      const intst = interestAt(x, y + lineHeight / 2);

      // ── Always place a word — vary SPACING not presence ──
      // This ensures full scene coverage (no black gaps).
      // High interest = tight spacing, low interest = wider spacing.

      const region = classifyRegion(
        row, Math.floor(x / 8), rows, Math.floor(outW / 8),
        s.lum, s.r, s.g, s.b, timeOfDay, biome
      );
      const word = getContextualWord(region, wordRng);

      // Font size: bigger at object edges, smaller in uniform areas
      const fontSize = intst > 0.4 ? 13 : intst > 0.2 ? 11 : 10;
      ctx.font = `${fontSize}px Georgia`;

      const wordWidth = ctx.measureText(word).width;
      if (x + wordWidth > outW) break;

      // ── Color from scene ──
      // Normalize to preserve hue, then scale by interest for intensity
      const maxC = Math.max(s.r, s.g, s.b, 1);
      const intensity = 120 + intst * 135;
      const cr = Math.min(255, Math.floor((s.r / maxC) * intensity + 30));
      const cg = Math.min(255, Math.floor((s.g / maxC) * intensity + 30));
      const cb = Math.min(255, Math.floor((s.b / maxC) * intensity + 30));

      // Alpha: brighter/more interesting = more visible
      const alpha = 0.35 + s.lum * 0.35 + intst * 0.3;

      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
      ctx.fillText(word, x, y);

      // Spacing: tight where interesting, wide where uniform
      const gap = intst > 0.3 ? 3 : intst > 0.1 ? 5 : 8;
      x += wordWidth + gap;
    }
  }
}
