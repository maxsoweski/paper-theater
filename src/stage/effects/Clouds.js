/**
 * Cloud system — Points-based cloud particles that drift across the sky.
 *
 * Uses large point sizes with soft alpha for a low-poly cloud look.
 * One draw call for the entire cloud system.
 */

import * as THREE from 'three';

export class Clouds {
  constructor(scene, opts = {}) {
    const {
      count = 40,
      spreadX = 120,
      spreadZ = 80,
      minY = 20,
      maxY = 35,
      pointSize = 12,
      color = 0xffffff,
      opacity = 0.5,
      speed = 0.8,
    } = opts;

    this.scene = scene;
    this.count = count;
    this.spreadX = spreadX;
    this.speed = speed;

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = minY + Math.random() * (maxY - minY);
      positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;
      sizes[i] = pointSize * (0.5 + Math.random() * 1.0);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Generate a soft circular sprite texture procedurally
    const texSize = 64;
    const texCanvas = document.createElement('canvas');
    texCanvas.width = texSize;
    texCanvas.height = texSize;
    const tCtx = texCanvas.getContext('2d');
    const gradient = tCtx.createRadialGradient(
      texSize / 2, texSize / 2, 0,
      texSize / 2, texSize / 2, texSize / 2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    tCtx.fillStyle = gradient;
    tCtx.fillRect(0, 0, texSize, texSize);
    const spriteMap = new THREE.CanvasTexture(texCanvas);

    const mat = new THREE.PointsMaterial({
      color,
      size: pointSize,
      map: spriteMap,
      sizeAttenuation: true,
      transparent: true,
      opacity,
      depthWrite: false,
      fog: true,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.userData.isEffect = true;
    scene.add(this.points);
  }

  /** Per-frame update: drift clouds along X, wrap at edges. */
  update(dt) {
    const pos = this.points.geometry.attributes.position;
    const halfX = this.spreadX / 2;

    for (let i = 0; i < this.count; i++) {
      let x = pos.getX(i);
      x += this.speed * dt;
      if (x > halfX) x -= this.spreadX;
      pos.setX(i, x);
    }
    pos.needsUpdate = true;
  }

  /** Update color/opacity for time-of-day changes. */
  setStyle(color, opacity) {
    this.points.material.color.setHex(color);
    this.points.material.opacity = opacity;
  }

  dispose() {
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
