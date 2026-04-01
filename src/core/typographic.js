/**
 * Typographic Renderer — Scene-Shaped Text
 *
 * The text FORMS the landscape. Where there's a tree, you see a tree-shaped
 * cluster of words like "leaves bark canopy". Where there's sky, you see
 * sparse sky-colored words. Where there's nothing, there's nothing.
 *
 * Approach:
 *   1. Sample the 3D render into a fine grid (every ~8px)
 *   2. For each grid cell, check if there's meaningful content (brightness)
 *   3. Compare each cell's color to its neighbors to detect edges/objects
 *   4. Place words only where objects are, using scene color + region words
 *   5. Text density varies: objects are dense, sky is sparse, ground is medium
 */

import { classifyRegion, getContextualWord } from './contextual-words.js';
import { createRng } from './random.js';

/**
 * Sample the scene into a fine grid.
 */
function sampleScene(srcCtx, srcW, srcH, cols, rows) {
  const imageData = srcCtx.getImageData(0, 0, srcW, srcH);
  const px = imageData.data;

  const brightness = new Float32Array(cols * rows);
  const colors = new Uint8Array(cols * rows * 3);

  const cellW = srcW / cols;
  const cellH = srcH / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sx = Math.floor((col + 0.5) * cellW);
      const sy = Math.floor((row + 0.5) * cellH);
      const idx = (sy * srcW + sx) * 4;

      const r = px[idx], g = px[idx + 1], b = px[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      const gi = row * cols + col;
      brightness[gi] = lum;
      colors[gi * 3] = r;
      colors[gi * 3 + 1] = g;
      colors[gi * 3 + 2] = b;
    }
  }

  return { brightness, colors };
}

/**
 * Detect how "interesting" a grid cell is by comparing to its neighbors.
 * High contrast with neighbors = edge of an object = important.
 * Uniform area = background = less important.
 */
function computeInterest(brightness, cols, rows) {
  const interest = new Float32Array(cols * rows);

  for (let row = 1; row < rows - 1; row++) {
    for (let col = 1; col < cols - 1; col++) {
      const gi = row * cols + col;
      const c = brightness[gi];

      // Average difference from 4 neighbors
      const diff = (
        Math.abs(c - brightness[gi - 1]) +
        Math.abs(c - brightness[gi + 1]) +
        Math.abs(c - brightness[gi - cols]) +
        Math.abs(c - brightness[gi + cols])
      ) / 4;

      // Interest = brightness + edge contrast
      // Objects are both bright AND have edges
      interest[gi] = Math.min(1, c * 0.6 + diff * 8);
    }
  }

  return interest;
}

/**
 * Render the typographic scene.
 */
export function renderTypographic(ctx, srcCtx, width, height, opts = {}) {
  const {
    font = '11px Georgia',
    lineHeight = 14,
    bgColor = '#060608',
    timeOfDay = 'day',
    seed = 'default',
    biome = 'forest',
  } = opts;

  // Fine sampling grid — one cell per ~8px
  const cellSize = 8;
  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);

  const { brightness, colors } = sampleScene(srcCtx, width, height, cols, rows);
  const interest = computeInterest(brightness, cols, rows);

  // Auto-contrast
  let minBr = 1, maxBr = 0;
  for (let i = 0; i < brightness.length; i++) {
    if (brightness[i] < minBr) minBr = brightness[i];
    if (brightness[i] > maxBr) maxBr = brightness[i];
  }
  const brRange = maxBr - minBr || 1;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.textBaseline = 'top';

  const wordRng = createRng(`${seed}-words`);

  // Render text row by row
  const textRows = Math.floor(height / lineHeight);

  for (let textRow = 0; textRow < textRows; textRow++) {
    const y = textRow * lineHeight;
    // Map text row to sample grid row
    const sampleRow = Math.floor((y / height) * rows);
    if (sampleRow >= rows) continue;

    let x = 0;

    while (x < width) {
      // Map x position to sample grid column
      const sampleCol = Math.min(Math.floor((x / width) * cols), cols - 1);
      const gi = sampleRow * cols + sampleCol;

      const br = (brightness[gi] - minBr) / brRange;
      const intst = interest[gi];
      const r = colors[gi * 3];
      const g = colors[gi * 3 + 1];
      const b = colors[gi * 3 + 2];

      // Skip only truly empty areas (below scene, beyond edges)
      if (br < 0.02 && intst < 0.02) {
        x += cellSize * 2;
        continue;
      }

      // Probability of placing a word scales with interest.
      // High interest (object edges) = always place. Low interest = sometimes skip.
      const placeProbability = 0.3 + intst * 0.7;
      if (wordRng.next() > placeProbability) {
        x += cellSize + Math.floor(wordRng.next() * cellSize * 2);
        continue;
      }

      // Pick word from the appropriate region
      const region = classifyRegion(
        sampleRow, sampleCol, rows, cols, br, r, g, b, timeOfDay, biome
      );
      const word = getContextualWord(region, wordRng);

      // Size: more interesting areas get larger text
      const fontSize = intst > 0.5 ? 12 : intst > 0.3 ? 11 : 10;
      ctx.font = `${fontSize}px Georgia`;

      const wordWidth = ctx.measureText(word).width;
      if (x + wordWidth > width) break;

      // Color: strongly tinted by scene color, with brightness-based intensity
      // Use HSL-like approach: keep the hue, boost lightness dramatically
      const maxC = Math.max(r, g, b, 1);
      const nr = r / maxC; // normalized color ratios (preserve hue)
      const ng = g / maxC;
      const nb = b / maxC;

      // Intensity based on interest level
      const intensity = 100 + intst * 155;
      const cr = Math.min(255, Math.floor(nr * intensity + 40));
      const cg = Math.min(255, Math.floor(ng * intensity + 40));
      const cb = Math.min(255, Math.floor(nb * intensity + 40));
      const alpha = 0.5 + intst * 0.5;

      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
      ctx.fillText(word, x, y);

      // Spacing: denser where more interesting
      const gap = intst > 0.4 ? 3 : intst > 0.2 ? 6 : 10;
      x += wordWidth + gap;
    }
  }
}
