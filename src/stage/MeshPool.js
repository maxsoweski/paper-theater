/**
 * MeshPool — InstancedMesh batching system.
 *
 * Instead of creating individual Mesh/Group per object (200 trees = 200+ draw calls),
 * MeshPool creates one InstancedMesh per geometry type and sets per-instance transforms.
 * Result: 200 trees = 1 draw call.
 *
 * Usage:
 *   const pool = new MeshPool(scene);
 *   pool.beginBatch();
 *   pool.add('pine', position, rotation, scale, colorVariant);
 *   pool.add('pine', position2, ...);
 *   pool.add('boulder', position3, ...);
 *   pool.commitBatch();  // Creates InstancedMeshes and adds to scene
 */

import * as THREE from 'three';

const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();
const _color = new THREE.Color();

export class MeshPool {
  constructor(scene) {
    this.scene = scene;
    this._registry = new Map();   // type → { geometry, material, parts[] }
    this._batches = new Map();    // type → [{ pos, rot, scale, color }]
    this._instances = [];         // Active InstancedMesh refs (for cleanup)
  }

  /**
   * Register a mesh type with its geometry and material.
   * For compound objects (like a tree = trunk + canopy), register multiple parts.
   *
   * @param {string} type - Unique type name (e.g., 'pine')
   * @param {Array<{geometry: BufferGeometry, material: Material, offset: Vector3}>} parts
   */
  registerType(type, parts) {
    this._registry.set(type, parts);
  }

  /** Start collecting placements for a new scene. */
  beginBatch() {
    this._batches.clear();
  }

  /**
   * Add an object placement to the current batch.
   *
   * @param {string} type - Registered type name
   * @param {THREE.Vector3} position - World position
   * @param {number} rotationY - Y rotation in radians
   * @param {number} scale - Uniform scale
   * @param {THREE.Color|number} [color] - Optional per-instance color tint
   */
  add(type, position, rotationY = 0, scale = 1, color = null) {
    if (!this._registry.has(type)) {
      console.warn(`[MeshPool] Unknown type: ${type}`);
      return;
    }
    if (!this._batches.has(type)) {
      this._batches.set(type, []);
    }
    this._batches.get(type).push({ position, rotationY, scale, color });
  }

  /**
   * Create InstancedMeshes from the collected batch and add to scene.
   * Returns metadata for the animation registry.
   */
  commitBatch() {
    // Clean up previous instances
    this.clear();

    const metadata = { instanceCount: 0, drawCalls: 0 };

    for (const [type, placements] of this._batches) {
      const parts = this._registry.get(type);
      if (!parts || placements.length === 0) continue;

      // Create one InstancedMesh per part of this type
      for (const part of parts) {
        const instMesh = new THREE.InstancedMesh(
          part.geometry,
          part.material,
          placements.length
        );
        instMesh.userData.poolType = type;
        instMesh.userData.poolPart = part.name || 'default';

        const hasColors = placements.some(p => p.color !== null);

        for (let i = 0; i < placements.length; i++) {
          const p = placements[i];

          // Build transform matrix: position + rotation + scale + part offset
          _position.copy(p.position);
          if (part.offset) {
            // Apply part offset in local space (rotated)
            const ox = part.offset.x * p.scale;
            const oy = part.offset.y * p.scale;
            const oz = part.offset.z * p.scale;
            _position.x += Math.cos(p.rotationY) * ox - Math.sin(p.rotationY) * oz;
            _position.y += oy;
            _position.z += Math.sin(p.rotationY) * ox + Math.cos(p.rotationY) * oz;
          }

          _euler.set(0, p.rotationY, 0);
          _quaternion.setFromEuler(_euler);
          _scale.setScalar(p.scale);

          _matrix.compose(_position, _quaternion, _scale);
          instMesh.setMatrixAt(i, _matrix);

          if (hasColors && p.color !== null) {
            _color.set(p.color);
            instMesh.setColorAt(i, _color);
          }
        }

        instMesh.instanceMatrix.needsUpdate = true;
        if (instMesh.instanceColor) instMesh.instanceColor.needsUpdate = true;

        this.scene.add(instMesh);
        this._instances.push(instMesh);
        metadata.drawCalls++;
      }

      metadata.instanceCount += placements.length;
    }

    return metadata;
  }

  /** Remove all instanced meshes from scene and dispose. */
  clear() {
    for (const inst of this._instances) {
      this.scene.remove(inst);
      // Don't dispose shared geometry/material — they're reused across rebuilds
    }
    this._instances = [];
  }

  /** Get stats for debugging. */
  getStats() {
    return {
      registeredTypes: this._registry.size,
      activeInstances: this._instances.length,
      totalObjects: this._instances.reduce((s, m) => s + m.count, 0),
      drawCalls: this._instances.length,
    };
  }

  dispose() {
    this.clear();
    // Now dispose shared geometry/material
    for (const [, parts] of this._registry) {
      for (const part of parts) {
        part.geometry.dispose();
        part.material.dispose();
      }
    }
    this._registry.clear();
  }
}
