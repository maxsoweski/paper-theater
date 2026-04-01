/**
 * AnimationRegistry — centralized animation update loop.
 *
 * Instead of hardcoding animation logic in main.js (traverse scene for windmills),
 * objects register their update functions here. The registry ticks all of them per frame.
 *
 * Supports:
 *   - Procedural animations (wind sway, rotation, oscillation)
 *   - Three.js AnimationMixer clips (for loaded models)
 *   - Time-based updates (fireflies only at night, etc.)
 */

export class AnimationRegistry {
  constructor() {
    this._entries = new Map(); // id → { update, active }
    this._mixers = [];         // THREE.AnimationMixer instances
  }

  /**
   * Register a procedural animation.
   *
   * @param {string} id - Unique identifier
   * @param {Function} updateFn - Called per frame: (deltaTime, elapsedTime) => void
   */
  register(id, updateFn) {
    this._entries.set(id, { update: updateFn, active: true });
  }

  /** Unregister an animation. */
  unregister(id) {
    this._entries.delete(id);
  }

  /** Register a Three.js AnimationMixer (for loaded model clips). */
  addMixer(mixer) {
    this._mixers.push(mixer);
  }

  /** Pause/resume an animation by id. */
  setActive(id, active) {
    const entry = this._entries.get(id);
    if (entry) entry.active = active;
  }

  /**
   * Update all registered animations. Call once per frame.
   *
   * @param {number} deltaTime - Seconds since last frame
   * @param {number} elapsedTime - Total seconds since start
   */
  update(deltaTime, elapsedTime) {
    for (const [, entry] of this._entries) {
      if (entry.active) {
        entry.update(deltaTime, elapsedTime);
      }
    }

    for (const mixer of this._mixers) {
      mixer.update(deltaTime);
    }
  }

  /** Clear all animations (on scene rebuild). */
  clear() {
    this._entries.clear();
    this._mixers = [];
  }

  /** Stats for debugging. */
  getStats() {
    return {
      procedural: this._entries.size,
      mixers: this._mixers.length,
      active: [...this._entries.values()].filter(e => e.active).length,
    };
  }
}
