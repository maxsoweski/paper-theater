/**
 * Seeded random number generator (Alea algorithm).
 * Same seed always produces the same sequence — scenes are reproducible.
 */
import Alea from 'alea';

export function createRng(seed) {
  const rng = Alea(seed);

  return {
    /** Random float in [0, 1) */
    next: () => rng(),

    /** Random float in [min, max) */
    range: (min, max) => min + rng() * (max - min),

    /** Random integer in [min, max] inclusive */
    int: (min, max) => Math.floor(min + rng() * (max - min + 1)),

    /** Pick a random element from an array */
    pick: (arr) => arr[Math.floor(rng() * arr.length)],

    /** Gaussian-ish random (Box-Muller) for natural variation */
    gaussian: (mean = 0, stddev = 1) => {
      const u1 = rng();
      const u2 = rng();
      const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
      return mean + z * stddev;
    },
  };
}
