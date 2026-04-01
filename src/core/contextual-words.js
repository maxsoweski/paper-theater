/**
 * Contextual Word System
 *
 * Instead of mapping brightness to random characters, we map scene regions
 * to conceptually relevant words. The text overlaying trees says "leaves",
 * "branches", "wind". The text overlaying sky says "vast", "blue", "light".
 *
 * This creates a typographic scene where the TEXT IS the landscape.
 */

/** Word pools keyed by scene region */
export const WORD_POOLS = {
  sky: [
    'sky', 'blue', 'vast', 'light', 'air', 'breath', 'open', 'above',
    'infinite', 'clear', 'bright', 'space', 'heaven', 'dome', 'azure',
    'expanse', 'atmosphere', 'ether', 'void', 'luminous',
  ],
  skyDawn: [
    'dawn', 'waking', 'rose', 'gold', 'new', 'morning', 'first light',
    'horizon', 'warmth', 'stirring', 'gentle', 'soft', 'blush', 'amber',
  ],
  skyDusk: [
    'dusk', 'fading', 'amber', 'crimson', 'last light', 'glow', 'embers',
    'settling', 'violet', 'twilight', 'lingering', 'warm', 'deep', 'burnished',
  ],
  skyNight: [
    'night', 'dark', 'stars', 'silence', 'deep', 'dream', 'vast',
    'cosmos', 'still', 'quiet', 'moon', 'shadow', 'sleep', 'infinite',
  ],
  cloud: [
    'cloud', 'drift', 'soft', 'float', 'mist', 'vapor', 'wisp',
    'billow', 'haze', 'gather', 'dissolve', 'cumulus', 'feather', 'silk',
  ],
  sun: [
    'sun', 'light', 'warmth', 'radiance', 'glow', 'golden', 'fire',
    'blaze', 'life', 'shine', 'bright', 'heat', 'corona', 'dawn',
  ],
  moon: [
    'moon', 'silver', 'pale', 'glow', 'quiet', 'reflected', 'cool',
    'crescent', 'luminous', 'tide', 'night', 'serene', 'orbital',
  ],
  star: [
    'star', 'distant', 'ancient', 'light', 'flicker', 'point', 'far',
    'eternal', 'diamond', 'spark', 'hydrogen', 'fusion', 'twinkle',
  ],
  mountainFar: [
    'peak', 'distant', 'stone', 'ancient', 'ridge', 'summit', 'silent',
    'granite', 'enduring', 'immense', 'mass', 'cold', 'bare', 'timeless',
    'geological', 'formation', 'range', 'horizon', 'weight', 'solid',
  ],
  mountainMid: [
    'hill', 'slope', 'rock', 'earth', 'terrain', 'ridge', 'ascent',
    'gravel', 'steep', 'path', 'weathered', 'erosion', 'sediment', 'crag',
  ],
  treeline: [
    'tree', 'leaves', 'branches', 'forest', 'canopy', 'green', 'shade',
    'roots', 'bark', 'sway', 'wind', 'rustle', 'pine', 'oak', 'birch',
    'needle', 'ring', 'growth', 'trunk', 'crown', 'wood', 'grove',
    'thicket', 'verdant', 'photosynthesis', 'chlorophyll', 'breath',
  ],
  foreground: [
    'grass', 'earth', 'soil', 'ground', 'close', 'here', 'present',
    'moss', 'dirt', 'pebble', 'near', 'texture', 'underfoot', 'solid',
    'loam', 'clay', 'root', 'worm', 'seed', 'dew', 'footprint',
  ],
  structure: [
    'home', 'shelter', 'roof', 'door', 'window', 'hearth', 'dwelling',
    'warmth', 'built', 'human', 'habitation', 'chimney', 'wall', 'rest',
  ],
  water: [
    'water', 'flow', 'ripple', 'reflect', 'deep', 'current', 'wave',
    'surface', 'pool', 'stream', 'tide', 'shimmer', 'blue', 'still',
  ],
  desert: [
    'sand', 'heat', 'mirage', 'sun', 'scorched', 'dry', 'bone', 'dust',
    'wind', 'dune', 'thirst', 'vast', 'barren', 'erosion', 'mesa',
    'horizon', 'shimmer', 'sparse', 'hardy', 'endurance',
  ],
  tundra: [
    'ice', 'crystal', 'frozen', 'silence', 'permafrost', 'white', 'breath',
    'cold', 'still', 'hardy', 'sparse', 'lichen', 'frost', 'windswept',
    'exposed', 'endure', 'pale', 'thin', 'stark', 'survival',
  ],
  coast: [
    'salt', 'wave', 'shore', 'tide', 'foam', 'horizon', 'pull', 'sand',
    'drift', 'spray', 'shell', 'breeze', 'gull', 'swell', 'sea',
    'current', 'dune', 'wrack', 'brine', 'ebb',
  ],
  swamp: [
    'murk', 'decay', 'moss', 'humid', 'slow', 'dark', 'water', 'rot',
    'cypress', 'mire', 'dank', 'still', 'spore', 'fungus', 'ooze',
    'root', 'shadow', 'damp', 'growth', 'thick',
  ],
  savanna: [
    'golden', 'heat', 'grass', 'vast', 'horizon', 'dry', 'warm', 'dust',
    'wide', 'plain', 'graze', 'amber', 'sun', 'thorn', 'acacia',
    'open', 'wind', 'herd', 'savanna', 'parched',
  ],
  tropical: [
    'lush', 'humid', 'green', 'dense', 'canopy', 'drip', 'fern', 'frond',
    'rain', 'alive', 'vine', 'orchid', 'steam', 'growth', 'tropical',
    'palm', 'exotic', 'thick', 'moist', 'vibrant',
  ],
  volcanic: [
    'obsidian', 'ash', 'fire', 'molten', 'ember', 'smoke', 'sulfur', 'crack',
    'heat', 'forge', 'lava', 'basalt', 'char', 'magma', 'scorch',
    'cinder', 'dark', 'glow', 'eruption', 'primal',
  ],
  autumn: [
    'amber', 'falling', 'change', 'crisp', 'golden', 'release', 'turning', 'cool',
    'harvest', 'drift', 'maple', 'oak', 'rust', 'copper', 'season',
    'leaf', 'wind', 'decay', 'spice', 'warm',
  ],
  wetland: [
    'reed', 'still', 'water', 'mirror', 'flat', 'mud', 'shallow', 'cattail',
    'heron', 'patience', 'marsh', 'silt', 'ripple', 'bank', 'mist',
    'fog', 'wade', 'sedge', 'quiet', 'pool',
  ],
};

/**
 * Determine the scene region for a grid cell based on its position and brightness.
 *
 * @param {number} row - Grid row (0 = top)
 * @param {number} col - Grid column
 * @param {number} rows - Total rows
 * @param {number} cols - Total columns
 * @param {number} brightness - Normalized brightness (0-1)
 * @param {number} r - Red channel (0-255)
 * @param {number} g - Green channel (0-255)
 * @param {number} b - Blue channel (0-255)
 * @param {string} timeOfDay
 * @returns {string} Region key from WORD_POOLS
 */
export function classifyRegion(row, col, rows, cols, brightness, r, g, b, timeOfDay, biome) {
  const yFrac = row / rows;

  // ── Color-driven classification ──
  // Analyze the actual pixel color rather than relying on screen position.

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max > 0 ? (max - min) / max : 0;

  // Very bright spot = sun or moon
  if (brightness > 0.9) {
    return timeOfDay === 'night' ? 'moon' : 'sun';
  }

  // Blue-dominant = sky
  const blueish = b > r * 1.1 && b > g * 0.9;
  if (blueish && yFrac < 0.6) {
    if (timeOfDay === 'night') {
      return brightness > 0.15 ? 'star' : 'skyNight';
    }
    if (brightness > 0.6 && sat < 0.3) return 'cloud';
    if (timeOfDay === 'dawn') return 'skyDawn';
    if (timeOfDay === 'dusk') return 'skyDusk';
    return 'sky';
  }

  // Night sky — dark and desaturated in upper half
  if (timeOfDay === 'night' && brightness < 0.15 && yFrac < 0.5) {
    return brightness > 0.05 ? 'skyNight' : 'skyNight';
  }

  // Warm/red dominant upper area = dawn/dusk sky
  const warmish = r > g && r > b;
  if (warmish && yFrac < 0.5 && sat > 0.1) {
    if (timeOfDay === 'dawn') return 'skyDawn';
    if (timeOfDay === 'dusk') return 'skyDusk';
  }

  // Fog zone — desaturated, matches fog color, near horizon
  if (sat < 0.15 && brightness > 0.2 && brightness < 0.7 && yFrac > 0.3 && yFrac < 0.6) {
    return 'mountainFar';
  }

  // Green-dominant = vegetation
  const greenish = g > r * 1.05 && g > b * 1.1;
  if (greenish) {
    // Bright green = treeline/canopy. Dark green = ground cover
    if (brightness > 0.15 || sat > 0.2) return 'treeline';
    return 'foreground';
  }

  // Brown/tan tones
  const brownish = r > b && g > b && Math.abs(r - g) < 40;
  if (brownish) {
    // Biome-specific: desert ground, wood structures, etc
    if (biome === 'desert') return 'desert';
    if (biome === 'coast') return 'coast';
    if (biome === 'savanna') return 'savanna';
    if (biome === 'autumn') return 'autumn';
    if (biome === 'wetland') return 'wetland';
    if (brightness > 0.2) return 'structure';
    return 'foreground';
  }

  // Grey/rock tones
  if (sat < 0.12 && brightness > 0.15 && brightness < 0.6) {
    if (biome === 'tundra') return 'tundra';
    if (biome === 'volcanic') return 'volcanic';
    if (biome === 'alpine') return 'mountainMid';
    return 'mountainFar';
  }

  // Dark lower portion = ground
  if (yFrac > 0.6 && brightness < 0.2) {
    if (biome === 'tundra') return 'tundra';
    if (biome === 'desert') return 'desert';
    if (biome === 'coast') return 'coast';
    if (biome === 'swamp') return 'swamp';
    if (biome === 'volcanic') return 'volcanic';
    if (biome === 'tropical') return 'tropical';
    if (biome === 'wetland') return 'wetland';
    return 'foreground';
  }

  // Fallback by position
  if (yFrac < 0.4) {
    if (timeOfDay === 'night') return 'skyNight';
    if (timeOfDay === 'dawn') return 'skyDawn';
    if (timeOfDay === 'dusk') return 'skyDusk';
    return 'sky';
  }
  if (yFrac < 0.65) return 'mountainMid';
  return 'foreground';
}

/**
 * Get a word from the appropriate pool for a scene cell.
 *
 * @param {string} region - Region key
 * @param {object} rng - Seeded RNG (for deterministic word selection)
 * @returns {string}
 */
export function getContextualWord(region, rng) {
  const pool = WORD_POOLS[region] || WORD_POOLS.sky;
  return pool[Math.floor(rng.next() * pool.length)];
}
