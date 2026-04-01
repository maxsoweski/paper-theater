/**
 * Stage — The 3D theater scene.
 *
 * A Three.js scene with:
 *   - Perspective camera (looking at the stage)
 *   - Ground plane
 *   - Sky (gradient shader)
 *   - Directional light (sun) + ambient
 *   - Fog for atmospheric perspective
 *
 * Optimized for embedding as a website background:
 *   - Render at configurable pixel ratio (0.5x for performance)
 *   - Frame-rate limitable
 *   - Single WebGLRenderer instance, reusable
 */

import * as THREE from 'three';

export class Stage {
  constructor(canvas, opts = {}) {
    const {
      pixelRatio = 0.75,  // Render below native res for performance
      maxFps = 30,        // Cap framerate for background use
    } = opts;

    this.canvas = canvas;
    this.maxFps = maxFps;
    this._lastFrame = 0;
    this._animating = false;
    this._onFrame = null; // External per-frame callback

    // ── Renderer ──
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // Low-poly doesn't need AA
      alpha: false,
      preserveDrawingBuffer: true, // Required for readPixels (text overlay)
    });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ── Scene ──
    this.scene = new THREE.Scene();

    // ── Camera ──
    // Positioned to look slightly down at the ground plane
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.camera.position.set(0, 8, 25);
    this.camera.lookAt(0, 3, 0);

    // ── Fog — atmospheric perspective ──
    this.scene.fog = new THREE.Fog(0x88aacc, 20, 100);
    // Scene background matches fog so edges don't show black
    this.scene.background = new THREE.Color(0x88aacc);

    // ── Lights ──
    this.ambientLight = new THREE.AmbientLight(0x445566, 0.6);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.position.set(20, 30, 10);
    this.scene.add(this.sunLight);

    // ── Ground plane ──
    // ── Ground plane (subdivided for displacement) ──
    this._groundSize = 200;
    this._groundSegments = 128;
    const groundGeo = new THREE.PlaneGeometry(
      this._groundSize, this._groundSize,
      this._groundSegments, this._groundSegments
    );
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3a5a2a });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = 0;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    this._terrainHeights = null; // Cached height lookup

    // ── Sky ──
    this._buildSky();

    // ── Resize handler ──
    this._onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', this._onResize);
  }

  _buildSky() {
    // Large sphere with gradient material (inside faces visible)
    const skyGeo = new THREE.SphereGeometry(800, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTopColor: { value: new THREE.Color(0x3878c8) },
        uBottomColor: { value: new THREE.Color(0xb0d0f0) },
        uSunColor: { value: new THREE.Color(0xffffee) },
        uSunDir: { value: new THREE.Vector3(0.5, 0.6, 0.3).normalize() },
        uSunSize: { value: 0.04 },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uBottomColor;
        uniform vec3 uSunColor;
        uniform vec3 uSunDir;
        uniform float uSunSize;
        varying vec3 vWorldPos;
        void main() {
          vec3 dir = normalize(vWorldPos);
          float y = dir.y * 0.5 + 0.5;
          vec3 sky = mix(uBottomColor, uTopColor, pow(y, 0.6));

          // Sun disc + glow
          float sunDot = max(0.0, dot(dir, uSunDir));
          float sun = smoothstep(1.0 - uSunSize, 1.0, sunDot);
          float glow = pow(sunDot, 16.0) * 0.4;
          sky += uSunColor * (sun + glow);

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
    });
    this.sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.sky);
    this._skyUniforms = skyMat.uniforms;
  }

  /**
   * Set time of day — adjusts sky colors, sun position, fog, lights.
   */
  setTimeOfDay(time) {
    const presets = {
      dawn: {
        top: 0x1a1940, bottom: 0xd09060, sun: 0xffcc77,
        sunDir: [-0.3, 0.15, 0.5], sunSize: 0.05,
        fog: 0xc09878, ambient: 0x554433, ambientI: 0.4,
        sunI: 0.8, ground: 0x3a4a2a,
      },
      day: {
        top: 0x3878c8, bottom: 0xb0d0f0, sun: 0xffffee,
        sunDir: [0.5, 0.7, 0.3], sunSize: 0.04,
        fog: 0x88aacc, ambient: 0x445566, ambientI: 0.6,
        sunI: 1.2, ground: 0x3a5a2a,
      },
      dusk: {
        top: 0x141430, bottom: 0xd06030, sun: 0xffaa44,
        sunDir: [0.6, 0.1, 0.4], sunSize: 0.06,
        fog: 0x8a5540, ambient: 0x443322, ambientI: 0.4,
        sunI: 0.7, ground: 0x3a3a22,
      },
      night: {
        top: 0x050510, bottom: 0x0a0a20, sun: 0xaabbdd,
        sunDir: [0.3, 0.5, -0.4], sunSize: 0.03,
        fog: 0x0a0a18, ambient: 0x111122, ambientI: 0.3,
        sunI: 0.3, ground: 0x151520,
      },
    };

    const p = presets[time] || presets.day;

    this._skyUniforms.uTopColor.value.setHex(p.top);
    this._skyUniforms.uBottomColor.value.setHex(p.bottom);
    this._skyUniforms.uSunColor.value.setHex(p.sun);
    this._skyUniforms.uSunDir.value.set(...p.sunDir).normalize();
    this._skyUniforms.uSunSize.value = p.sunSize;

    this.scene.fog.color.setHex(p.fog);
    this.scene.background.setHex(p.fog);
    this.ambientLight.color.setHex(p.ambient);
    this.ambientLight.intensity = p.ambientI;
    this.sunLight.color.setHex(p.sun);
    this.sunLight.intensity = p.sunI;
    this.sunLight.position.set(...p.sunDir).multiplyScalar(40);
    this.ground.material.color.setHex(p.ground);
  }

  /**
   * Apply terrain displacement using a noise function.
   * Creates gentle rolling hills. Biome controls amplitude.
   *
   * @param {object} rng - Seeded RNG
   * @param {number} amplitude - Max height displacement (default 1.5)
   * @param {number} frequency - Noise frequency (default 0.03)
   */
  displaceTerrain(rng, amplitude = 1.5, frequency = 0.03) {
    const pos = this.ground.geometry.attributes.position;
    const seg = this._groundSegments + 1;
    const half = this._groundSize / 2;

    // Build a simple 2D value noise table
    const tableSize = 64;
    const table = new Float32Array(tableSize * tableSize);
    for (let i = 0; i < table.length; i++) {
      table[i] = rng.next() * 2 - 1;
    }

    const sample2D = (x, z) => {
      const tx = ((x * frequency) % tableSize + tableSize) % tableSize;
      const tz = ((z * frequency) % tableSize + tableSize) % tableSize;
      const ix = Math.floor(tx), iz = Math.floor(tz);
      const fx = tx - ix, fz = tz - iz;
      const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
      const i00 = (ix % tableSize) + (iz % tableSize) * tableSize;
      const i10 = ((ix + 1) % tableSize) + (iz % tableSize) * tableSize;
      const i01 = (ix % tableSize) + ((iz + 1) % tableSize) * tableSize;
      const i11 = ((ix + 1) % tableSize) + ((iz + 1) % tableSize) * tableSize;
      return (table[i00] * (1 - sx) * (1 - sz) +
              table[i10] * sx * (1 - sz) +
              table[i01] * (1 - sx) * sz +
              table[i11] * sx * sz);
    };

    // Cache heights for object snapping
    this._terrainHeights = new Float32Array(seg * seg);

    for (let i = 0; i < pos.count; i++) {
      // PlaneGeometry rotated -90° X: positions are (x, z_world, -y_world) before rotation
      // After rotation, the y attribute becomes the Z world coordinate
      const px = pos.getX(i);
      const pz = pos.getY(i); // This is Z in world space after rotation

      // Multi-octave noise for natural terrain
      let h = 0;
      h += sample2D(px, pz) * amplitude;
      h += sample2D(px * 2.1, pz * 2.1) * amplitude * 0.4;
      h += sample2D(px * 4.3, pz * 4.3) * amplitude * 0.15;

      pos.setZ(i, h); // Z becomes Y after the -90° X rotation
      this._terrainHeights[i] = h;
    }

    pos.needsUpdate = true;
    this.ground.geometry.computeVertexNormals();
  }

  /**
   * Get terrain height at a world (x, z) position.
   * Uses bilinear interpolation on the displacement grid.
   *
   * @param {number} x - World X
   * @param {number} z - World Z
   * @returns {number} Y height at that position
   */
  getTerrainHeight(x, z) {
    if (!this._terrainHeights) return 0;
    const half = this._groundSize / 2;
    const seg = this._groundSegments + 1;

    // Map world coords to grid coords
    const gx = ((x + half) / this._groundSize) * (seg - 1);
    const gz = ((-z + half) / this._groundSize) * (seg - 1); // Z is flipped

    const ix = Math.floor(gx), iz = Math.floor(gz);
    const fx = gx - ix, fz = gz - iz;

    if (ix < 0 || ix >= seg - 1 || iz < 0 || iz >= seg - 1) return 0;

    const h00 = this._terrainHeights[iz * seg + ix];
    const h10 = this._terrainHeights[iz * seg + ix + 1];
    const h01 = this._terrainHeights[(iz + 1) * seg + ix];
    const h11 = this._terrainHeights[(iz + 1) * seg + ix + 1];

    return h00 * (1 - fx) * (1 - fz) + h10 * fx * (1 - fz) +
           h01 * (1 - fx) * fz + h11 * fx * fz;
  }

  /**
   * Clear all objects from the scene (keeps ground, sky, lights).
   */
  clearObjects() {
    const keep = new Set([this.ground, this.sky, this.ambientLight, this.sunLight]);
    const toRemove = [];
    this.scene.traverse((obj) => {
      if (!keep.has(obj) && obj !== this.scene && obj.parent === this.scene) {
        toRemove.push(obj);
      }
    });
    for (const obj of toRemove) {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
  }

  /**
   * Add a mesh to the scene.
   */
  add(obj) {
    this.scene.add(obj);
  }

  /**
   * Start the render loop.
   */
  start(onFrame) {
    this._onFrame = onFrame || null;
    this._animating = true;
    this._loop();
  }

  stop() {
    this._animating = false;
  }

  _loop() {
    if (!this._animating) return;
    requestAnimationFrame(() => this._loop());

    // Frame rate limiting
    const now = performance.now();
    const minInterval = 1000 / this.maxFps;
    if (now - this._lastFrame < minInterval) return;
    this._lastFrame = now;

    if (this._onFrame) this._onFrame(now);
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Read the current render as pixel data (for typographic overlay).
   */
  readPixels() {
    const w = this.renderer.domElement.width;
    const h = this.renderer.domElement.height;
    const pixels = new Uint8Array(w * h * 4);
    const gl = this.renderer.getContext();
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return { pixels, width: w, height: h };
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
