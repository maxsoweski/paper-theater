/**
 * Semantic Tag Dictionary
 *
 * Every mesh type and scene element has a rich set of associated words.
 * These go far beyond simple labels — they simulate conceptual experience:
 *   - What the thing IS (primary names, synonyms)
 *   - Its scientific/formal identity
 *   - Its subcomponents and parts
 *   - Sensory associations (what it feels like, sounds like)
 *   - Conceptual associations (what it makes you think of)
 *
 * Boundary tags describe the GROUPING concept that appears at edges
 * where one region meets another (forest edge, shoreline, etc.)
 */

export const TAGS = {
  // ── Sky / atmosphere ──
  sky: {
    words: [
      'sky', 'blue', 'vast', 'above', 'air', 'atmosphere', 'dome', 'heaven',
      'expanse', 'open', 'infinite', 'breath', 'clear', 'ether', 'space',
      'azure', 'canopy', 'overhead', 'firmament', 'void', 'luminous',
    ],
  },
  cloud: {
    words: [
      'cloud', 'drift', 'vapor', 'wisp', 'billow', 'float', 'soft', 'mist',
      'cumulus', 'dissolve', 'feather', 'silk', 'gather', 'haze', 'cotton',
      'form', 'shapeless', 'nimbus', 'white', 'airy',
    ],
  },
  sun: {
    words: [
      'sun', 'light', 'warmth', 'radiance', 'glow', 'golden', 'fire',
      'blaze', 'life', 'shine', 'bright', 'corona', 'star', 'energy',
      'photon', 'fusion', 'dawn', 'day',
    ],
  },
  moon: {
    words: [
      'moon', 'silver', 'pale', 'reflected', 'cool', 'crescent', 'luminous',
      'tide', 'night', 'serene', 'orbital', 'phase', 'wax', 'wane',
      'lunar', 'crater', 'quiet', 'glow',
    ],
  },
  star: {
    words: [
      'star', 'distant', 'ancient', 'twinkle', 'point', 'eternal', 'diamond',
      'spark', 'hydrogen', 'fusion', 'light-year', 'constellation', 'far',
      'flicker', 'cosmos', 'stellar', 'navigate',
    ],
  },
  ground: {
    words: [
      'earth', 'soil', 'ground', 'dirt', 'clay', 'loam', 'underfoot',
      'solid', 'root', 'worm', 'seed', 'dew', 'footprint', 'moss',
      'pebble', 'texture', 'mud', 'humus', 'mineral',
    ],
  },

  // ── Flora ──
  pine: {
    words: [
      'pine', 'conifer', 'evergreen', 'Pinaceae', 'needle', 'cone', 'bark',
      'sap', 'resin', 'branch', 'trunk', 'fragrant', 'green', 'tall',
      'straight', 'timber', 'whorl', 'pitch', 'bough', 'alpine',
    ],
  },
  pineDark: {
    words: [
      'spruce', 'fir', 'dark', 'dense', 'shadow', 'needle', 'evergreen',
      'conifer', 'boreal', 'taiga', 'deep', 'canopy', 'old-growth',
      'bark', 'resin', 'silent', 'ancient', 'moss-covered',
    ],
  },
  deciduous: {
    words: [
      'oak', 'maple', 'birch', 'leaf', 'branch', 'canopy', 'shade',
      'ring', 'bark', 'crown', 'root', 'growth', 'photosynthesis',
      'chlorophyll', 'sway', 'rustle', 'green', 'spread', 'broad',
    ],
  },
  deciduousLarge: {
    words: [
      'ancient', 'towering', 'oak', 'elm', 'beech', 'majestic', 'canopy',
      'broad', 'shade', 'cathedral', 'limb', 'trunk', 'gnarled', 'deep',
      'roots', 'crown', 'mighty', 'spreading', 'elder',
    ],
  },
  deciduousAutumn: {
    words: [
      'amber', 'falling', 'change', 'crisp', 'golden', 'release', 'turning',
      'maple', 'oak', 'rust', 'copper', 'season', 'leaf', 'drift',
      'harvest', 'warm', 'decay', 'spice', 'letting-go', 'transform',
    ],
  },
  bush: {
    words: [
      'bush', 'shrub', 'thicket', 'hedge', 'berry', 'tangle', 'low',
      'dense', 'cover', 'nest', 'shelter', 'wild', 'bramble', 'twig',
      'undergrowth', 'scrub', 'foliage', 'green',
    ],
  },
  palm: {
    words: [
      'palm', 'tropical', 'frond', 'coconut', 'Arecaceae', 'sway', 'beach',
      'trade-wind', 'oasis', 'shade', 'tall', 'curved', 'fan', 'warm',
      'island', 'coast', 'fibrous', 'crown', 'exotic',
    ],
  },
  acacia: {
    words: [
      'acacia', 'Fabaceae', 'flat-top', 'savanna', 'thorn', 'shade',
      'giraffe', 'Africa', 'wide', 'canopy', 'dry', 'umbrella', 'pod',
      'drought-resistant', 'golden', 'scattered', 'iconic',
    ],
  },
  snowPine: {
    words: [
      'pine', 'snow', 'hardy', 'windswept', 'stunted', 'treeline',
      'krummholz', 'resilient', 'cold', 'ice', 'frost', 'survive',
      'bent', 'alpine', 'exposed', 'tenacious', 'sparse',
    ],
  },
  deadTree: {
    words: [
      'dead', 'snag', 'bare', 'skeletal', 'decay', 'bleached', 'standing',
      'hollow', 'lightning', 'weathered', 'ghost', 'bone-white', 'dry',
      'woodpecker', 'perch', 'stark', 'silhouette', 'remains',
    ],
  },
  cactus: {
    words: [
      'cactus', 'succulent', 'Cactaceae', 'saguaro', 'prickly', 'spine',
      'needle', 'areole', 'sharp', 'pointy', 'ouch', 'waxy', 'water',
      'storage', 'arid', 'desert', 'flower', 'survive', 'tough', 'dry',
    ],
  },
  tallGrass: {
    words: [
      'grass', 'golden', 'sway', 'wind', 'seed', 'stalk', 'prairie',
      'wave', 'dry', 'rustle', 'whisper', 'blade', 'pollen', 'meadow',
      'field', 'tall', 'bend', 'sun-bleached',
    ],
  },
  mushroom: {
    words: [
      'mushroom', 'fungus', 'spore', 'cap', 'gill', 'mycelium', 'decay',
      'forest-floor', 'damp', 'shade', 'decompose', 'Amanita', 'ring',
      'fruiting', 'network', 'underground', 'symbiosis', 'fairy',
    ],
  },
  fern: {
    words: [
      'fern', 'frond', 'unfurl', 'ancient', 'Polypodiopsida', 'spore',
      'green', 'shade', 'damp', 'forest-floor', 'delicate', 'curl',
      'fractal', 'fiddlehead', 'lush', 'primitive', 'understory',
    ],
  },
  cattail: {
    words: [
      'cattail', 'Typha', 'reed', 'marsh', 'wetland', 'brown', 'stalk',
      'fluff', 'seed', 'water', 'pond', 'edge', 'tall', 'sway',
      'waterfowl', 'habitat', 'native', 'fibrous',
    ],
  },

  // ── Terrain features ──
  boulder: {
    words: [
      'boulder', 'rock', 'stone', 'granite', 'weathered', 'lichen', 'solid',
      'ancient', 'geological', 'mineral', 'heavy', 'moss', 'cool',
      'enduring', 'formation', 'sediment', 'mass',
    ],
  },
  boulderLarge: {
    words: [
      'monolith', 'massive', 'stone', 'outcrop', 'geological', 'formation',
      'ancient', 'immovable', 'landmark', 'granite', 'erosion', 'weight',
      'ages', 'tectonic', 'bedrock', 'primordial',
    ],
  },
  iceBoulder: {
    words: [
      'ice', 'glacial', 'erratic', 'frozen', 'crystal', 'cold', 'blue',
      'translucent', 'melt', 'ancient', 'moraine', 'permafrost',
      'crevasse', 'brittle', 'shimmer', 'polar',
    ],
  },
  rockArch: {
    words: [
      'arch', 'natural', 'bridge', 'erosion', 'sandstone', 'formation',
      'span', 'time', 'wind-carved', 'desert', 'monument', 'ancient',
      'frame', 'gateway', 'weathered', 'iconic',
    ],
  },
  sandDune: {
    words: [
      'dune', 'sand', 'wind', 'ripple', 'shift', 'golden', 'wave',
      'desert', 'dry', 'grain', 'migration', 'crest', 'slip-face',
      'Sahara', 'barren', 'sculpted', 'endless',
    ],
  },

  // ── Structures ──
  cabin: {
    words: [
      'cabin', 'home', 'shelter', 'roof', 'hearth', 'chimney', 'warmth',
      'wood', 'built', 'door', 'window', 'smoke', 'dwelling', 'rest',
      'human', 'refuge', 'cozy', 'log', 'habitation',
    ],
  },
  windmill: {
    words: [
      'windmill', 'blade', 'wind', 'grain', 'mill', 'turn', 'energy',
      'rural', 'Dutch', 'rotation', 'harvest', 'flour', 'tower',
      'mechanism', 'vane', 'pastoral', 'tradition',
    ],
  },
  fence: {
    words: [
      'fence', 'boundary', 'post', 'rail', 'enclosure', 'property',
      'field', 'divide', 'wooden', 'border', 'gate', 'pastoral',
      'contain', 'mark', 'line', 'territory',
    ],
  },
  lighthouse: {
    words: [
      'lighthouse', 'beacon', 'coast', 'warning', 'light', 'tower',
      'navigate', 'shore', 'keeper', 'lamp', 'maritime', 'safety',
      'signal', 'rocky', 'guide', 'sentinel', 'watch',
    ],
  },
  dock: {
    words: [
      'dock', 'pier', 'plank', 'wood', 'water', 'mooring', 'boat',
      'weathered', 'fishing', 'tide', 'rope', 'barnacle', 'salt',
      'creak', 'harbor', 'landing', 'jetty',
    ],
  },
  hayBale: {
    words: [
      'hay', 'bale', 'harvest', 'farm', 'golden', 'straw', 'field',
      'autumn', 'dry', 'bundle', 'pastoral', 'agriculture', 'barn',
      'feed', 'crop', 'sun-dried', 'roll',
    ],
  },
  driftwood: {
    words: [
      'driftwood', 'bleached', 'salt', 'shore', 'weathered', 'smooth',
      'journey', 'tide', 'ocean', 'worn', 'bone', 'beach', 'found',
      'grey', 'twisted', 'water-logged', 'stranded',
    ],
  },

  // ── Boundary / grouping concepts ──
  // These activate at edges where one type meets another
  boundary_forest: {
    words: [
      'forest', 'woods', 'treeline', 'edge', 'clearing', 'grove',
      'woodland', 'copse', 'stand', 'canopy-edge', 'emerge', 'threshold',
      'fringe', 'border',
    ],
  },
  boundary_desert: {
    words: [
      'desert', 'wasteland', 'expanse', 'arid', 'barren', 'frontier',
      'horizon', 'edge', 'vast', 'empty', 'boundary',
    ],
  },
  boundary_water: {
    words: [
      'shore', 'bank', 'waterline', 'edge', 'meeting', 'between',
      'shoreline', 'margin', 'littoral', 'threshold',
    ],
  },
  boundary_mountain: {
    words: [
      'ridge', 'treeline', 'elevation', 'timberline', 'exposed', 'edge',
      'above', 'summit-approach', 'boundary', 'transition',
    ],
  },
  boundary_field: {
    words: [
      'field', 'meadow', 'clearing', 'open', 'pasture', 'edge',
      'grassland', 'expanse', 'boundary', 'fence-line',
    ],
  },
};

/**
 * Get a random word for a given tag.
 */
export function getTagWord(tag, rng) {
  const entry = TAGS[tag];
  if (!entry) return tag; // fallback to the tag name itself
  return entry.words[Math.floor(rng.next() * entry.words.length)];
}

/**
 * Determine the boundary tag when two different object types meet.
 * Returns null if no special boundary concept applies.
 */
export function getBoundaryTag(typeA, typeB) {
  // Tree types → forest boundary
  const treeTypes = new Set([
    'pine', 'pineDark', 'deciduous', 'deciduousLarge', 'deciduousAutumn',
    'snowPine', 'palm', 'acacia',
  ]);

  if (treeTypes.has(typeA) !== treeTypes.has(typeB)) {
    // One is a tree, the other isn't → forest edge
    return 'boundary_forest';
  }

  // Cactus/sand types → desert boundary
  const desertTypes = new Set(['cactus', 'sandDune', 'rockArch']);
  if (desertTypes.has(typeA) !== desertTypes.has(typeB)) {
    return 'boundary_desert';
  }

  // Water-adjacent types
  const waterTypes = new Set(['cattail', 'dock', 'driftwood', 'lighthouse']);
  if (waterTypes.has(typeA) !== waterTypes.has(typeB)) {
    return 'boundary_water';
  }

  // Field types
  const fieldTypes = new Set(['fence', 'hayBale', 'tallGrass']);
  if (fieldTypes.has(typeA) !== fieldTypes.has(typeB)) {
    return 'boundary_field';
  }

  return null;
}
