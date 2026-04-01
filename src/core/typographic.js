/**
 * Typographic Renderer — Tag-Based Scene Text
 *
 * Uses an ID buffer to know EXACTLY what object is at each pixel position.
 * No color guessing — a cactus is tagged "cactus" and gets cactus words.
 *
 * Pipeline:
 *   1. Color buffer — the visual render (for color tinting)
 *   2. ID buffer — each object type encoded as a unique red channel value
 *   3. For each word position, read the ID → look up the tag → pick a word
 *   4. At boundaries (where ID changes), use grouping/boundary words
 */

import { getTagWord, getBoundaryTag } from './tags.js';
import { createRng } from './random.js';

/**
 * Render contextual words shaped by the 3D scene, using object ID tagging.
 *
 * @param {CanvasRenderingContext2D} ctx - Output text canvas
 * @param {Uint8Array} colorPixels - Color render pixels (RGBA, bottom-up)
 * @param {Uint8Array} idPixels - ID render pixels (R = type ID, bottom-up)
 * @param {number} srcW - Source pixel width
 * @param {number} srcH - Source pixel height
 * @param {number} outW - Output canvas width
 * @param {number} outH - Output canvas height
 * @param {Map<number, string>} idToType - Maps ID number → type name (e.g., 1 → 'pine')
 * @param {object} opts
 */
export function renderTypographic(ctx, colorPixels, idPixels, srcW, srcH, outW, outH, idToType, opts = {}) {
  const {
    font = '11px Georgia',
    lineHeight = 14,
    bgColor = '#060608',
    seed = 'default',
  } = opts;

  const scaleX = srcW / outW;
  const scaleY = srcH / outH;

  // Helper: sample a source pixel (bottom-up → top-down flip)
  function sampleColor(outX, outY) {
    const sx = Math.min(Math.floor(outX * scaleX), srcW - 1);
    const sy = Math.min(Math.floor(outY * scaleY), srcH - 1);
    // WebGL pixels are bottom-up, flip Y
    const flippedY = srcH - 1 - sy;
    const idx = (flippedY * srcW + sx) * 4;
    return {
      r: colorPixels[idx],
      g: colorPixels[idx + 1],
      b: colorPixels[idx + 2],
      lum: (0.299 * colorPixels[idx] + 0.587 * colorPixels[idx + 1] + 0.114 * colorPixels[idx + 2]) / 255,
    };
  }

  function sampleId(outX, outY) {
    const sx = Math.min(Math.floor(outX * scaleX), srcW - 1);
    const sy = Math.min(Math.floor(outY * scaleY), srcH - 1);
    const flippedY = srcH - 1 - sy;
    const idx = (flippedY * srcW + sx) * 4;
    return idPixels[idx]; // R channel = type ID
  }

  // Get the type name for a pixel position
  function typeAt(outX, outY) {
    const id = sampleId(outX, outY);
    return idToType.get(id) || 'sky';
  }

  // Detect boundary: does the type change between this point and a neighbor?
  function boundaryAt(outX, outY) {
    const center = typeAt(outX, outY);
    const step = 12;
    for (const [dx, dy] of [[-step, 0], [step, 0], [0, -step], [0, step]]) {
      const nx = outX + dx, ny = outY + dy;
      if (nx >= 0 && nx < outW && ny >= 0 && ny < outH) {
        const neighbor = typeAt(nx, ny);
        if (neighbor !== center) {
          return getBoundaryTag(center, neighbor);
        }
      }
    }
    return null;
  }

  // Interest: edge contrast in the color buffer
  function interestAt(outX, outY) {
    const c = sampleColor(outX, outY);
    const step = 8;
    let diff = 0, count = 0;
    for (const [dx, dy] of [[-step, 0], [step, 0], [0, -step], [0, step]]) {
      const nx = outX + dx, ny = outY + dy;
      if (nx >= 0 && nx < outW && ny >= 0 && ny < outH) {
        const n = sampleColor(nx, ny);
        diff += Math.abs(c.lum - n.lum);
        count++;
      }
    }
    return Math.min(1, c.lum * 0.5 + (diff / count) * 6);
  }

  // ── Render ──
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, outW, outH);
  ctx.textBaseline = 'top';

  const wordRng = createRng(`${seed}-words`);
  const rows = Math.floor(outH / lineHeight);

  for (let row = 0; row < rows; row++) {
    const y = row * lineHeight;
    let x = 2;

    while (x < outW - 2) {
      const sampleY = y + lineHeight / 2;
      const s = sampleColor(x, sampleY);
      const intst = interestAt(x, sampleY);
      const type = typeAt(x, sampleY);

      // Check for boundary — if at an edge between types, use boundary words
      const boundary = boundaryAt(x, sampleY);
      const tag = boundary || type;

      const word = getTagWord(tag, wordRng);

      // Font size by interest
      const fontSize = intst > 0.4 ? 13 : intst > 0.2 ? 11 : 10;
      ctx.font = `${fontSize}px Georgia`;

      const wordWidth = ctx.measureText(word).width;
      if (x + wordWidth > outW) break;

      // Color from scene, intensity scaled by interest
      const maxC = Math.max(s.r, s.g, s.b, 1);
      const intensity = 120 + intst * 135;
      const cr = Math.min(255, Math.floor((s.r / maxC) * intensity + 30));
      const cg = Math.min(255, Math.floor((s.g / maxC) * intensity + 30));
      const cb = Math.min(255, Math.floor((s.b / maxC) * intensity + 30));
      const alpha = 0.35 + s.lum * 0.35 + intst * 0.3;

      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
      ctx.fillText(word, x, y);

      // Spacing by interest
      const gap = intst > 0.3 ? 3 : intst > 0.1 ? 5 : 8;
      x += wordWidth + gap;
    }
  }
}
