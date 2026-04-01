/**
 * Star field — visible at night and dusk, with twinkle animation.
 *
 * Points scattered on an upper hemisphere, per-vertex opacity for twinkle.
 */

import * as THREE from 'three';

export class Stars {
  constructor(scene, opts = {}) {
    const {
      count = 200,
      radius = 150,
    } = opts;

    this.scene = scene;
    this.count = count;

    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);
    const twinkleSpeed = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random point on upper hemisphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.45; // above horizon
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi); // Y up
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      opacities[i] = 0.3 + Math.random() * 0.7;
      twinkleSpeed[i] = 0.5 + Math.random() * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom shader for per-vertex opacity twinkle
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uVisible: { value: 0 }, // 0 = hidden, 1 = visible
      },
      vertexShader: `
        attribute float opacity;
        attribute float speed;
        uniform float uTime;
        uniform float uVisible;
        varying float vAlpha;
        void main() {
          // Twinkle: oscillate opacity
          float twinkle = 0.5 + 0.5 * sin(uTime * speed + position.x * 0.1);
          vAlpha = opacity * twinkle * uVisible;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.0;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          if (vAlpha < 0.05) discard;
          gl_FragColor = vec4(1.0, 1.0, 0.95, vAlpha);
        }
      `,
    });

    // Add custom attributes
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    geo.setAttribute('speed', new THREE.BufferAttribute(twinkleSpeed, 1));

    this.points = new THREE.Points(geo, mat);
    this.points.userData.isEffect = true;
    scene.add(this.points);
    this._uniforms = mat.uniforms;
  }

  update(dt, elapsed) {
    this._uniforms.uTime.value = elapsed;
  }

  /** Show/hide based on time of day. */
  setVisible(visible) {
    this._uniforms.uVisible.value = visible ? 1 : 0;
  }

  dispose() {
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
