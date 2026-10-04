// ==========================================================
// REALISTIC 3D SOLAR SYSTEM  (full-screen, 4K ready)
// ----------------------------------------------------------
// Install:
//   npm i three @react-three/fiber @react-three/drei
//   (sirf wahi packages jo aapke original code me the)
//
// CSS (App.css / index.css me daalo):
//   .space-background { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 0; background: #000; }
//   .space-background canvas { display: block; width: 100% !important; height: 100% !important; }
//   .space-background-overlay { position: absolute; inset: 0; pointer-events: none;
//       background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%); }
//
// Koi image/texture file nahi chahiye: sab kuch GLSL shaders se procedural
// bana hai, isliye 4K pe bhi ekdam sharp rehta hai.
// ==========================================================

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";

// ==========================================================
// SHARED GLSL NOISE
// ==========================================================

const NOISE = /* glsl */ `
  float hash31(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(
        mix(hash31(i),                  hash31(i + vec3(1,0,0)), f.x),
        mix(hash31(i + vec3(0,1,0)),    hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(
        mix(hash31(i + vec3(0,0,1)),    hash31(i + vec3(1,0,1)), f.x),
        mix(hash31(i + vec3(0,1,1)),    hash31(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float fbm3(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }

  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }

  float ridged(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * (1.0 - abs(vnoise(p) * 2.0 - 1.0));
      p = p * 2.1 + vec3(3.3, 1.1, 7.7);
      a *= 0.5;
    }
    return v;
  }
`;

// ==========================================================
// SUN  (animated plasma, granulation, sunspots, limb darkening)
// ==========================================================

const SUN_VERT = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vView;

  void main() {
    vObj = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - w.xyz);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const SUN_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vView;

  ${NOISE}

  void main() {
    vec3 p = normalize(vObj);
    float t = uTime * 0.05;

    // domain warp -> flowing plasma
    vec3 q = p * 3.0;
    vec3 w = vec3(
      fbm3(q + vec3(t, 0.0, 0.0)),
      fbm3(q + vec3(0.0, t, 5.2)),
      fbm3(q + vec3(3.1, 0.0, t))
    );

    float gran  = fbm(q * 3.0 + w * 1.6 + t * 2.0);        // convection cells
    float cells = ridged(p * 14.0 + w * 0.7 + t * 1.5);    // bright cell borders
    float spots = smoothstep(0.60, 0.70, fbm3(p * 2.4 + vec3(t * 0.3) + 7.0));

    vec3 deep   = vec3(0.90, 0.22, 0.02);
    vec3 mid    = vec3(1.00, 0.52, 0.08);
    vec3 bright = vec3(1.00, 0.85, 0.45);
    vec3 hot    = vec3(1.00, 0.97, 0.78);

    vec3 col = mix(deep, mid, smoothstep(0.30, 0.65, gran));
    col = mix(col, bright, smoothstep(0.45, 0.85, cells * 0.65 + gran * 0.45));
    col = mix(col, hot, smoothstep(0.80, 1.00, cells * 0.5 + gran * 0.6));

    // sunspots (dark umbra)
    col *= 1.0 - 0.88 * spots;

    // limb darkening + reddening at the edge
    float mu = max(dot(normalize(vN), normalize(vView)), 0.0);
    float limb = 1.0 - 0.62 * (1.0 - mu);
    col = mix(col * vec3(1.0, 0.45, 0.2), col, pow(mu, 0.45));
    col *= limb;

    // bright emission (glow sprites add the halo)
    gl_FragColor = vec4(col * 1.25, 1.0);
    #include <colorspace_fragment>
  }
`;

function makeGlowTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, "rgb(129, 96, 6)");
  g.addColorStop(0.08, "rgba(255,200,110,0.75)");
  g.addColorStop(0.22, "rgba(66, 34, 12, 0.3)");
  g.addColorStop(0.5, "rgba(154, 241, 33, 0.08)");
  g.addColorStop(1.0, "rgba(255,40,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Sun() {
  const matRef = useRef();
  const sunRef = useRef();
  const glowA = useRef();
  const glowB = useRef();
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) matRef.current.uniforms.uTime.value = t;
    if (sunRef.current) sunRef.current.rotation.y += Math.min(delta, 0.05) * 0.03;

    // halka sa breathing corona
    const pulse = 1 + Math.sin(t * 0.6) * 0.015;
    if (glowA.current) glowA.current.scale.setScalar(15 * pulse);
    if (glowB.current) glowB.current.scale.setScalar(34 * (2 - pulse));
  });

  return (
    <group>
      <pointLight color="#f7cb6b" intensity={3} distance={0} decay={0} />

      <mesh ref={sunRef}>
        <sphereGeometry args={[3.2, 128, 128]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={SUN_VERT}
          fragmentShader={SUN_FRAG}
          toneMapped={false}
        />
      </mesh>

      <sprite ref={glowA} scale={[15, 15, 1]}>
        <spriteMaterial
          map={glowTex}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={0.95}
        />
      </sprite>

      <sprite ref={glowB} scale={[34, 34, 1]}>
        <spriteMaterial
          map={glowTex}
          color="#fff23d"
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={0.35}
        />
      </sprite>
    </group>
  );
}

// ==========================================================
// PLANET SHADER  (rocky / venus / earth / gas giant)
// ==========================================================

const PLANET_VERT = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vWorld;
  varying vec3 vView;

  void main() {
    vObj = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - w.xyz);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const PLANET_FRAG = /* glsl */ `
  uniform float uTime;
  uniform int   uType;
  uniform vec3  uA;
  uniform vec3  uB;
  uniform vec3  uC;
  uniform float uSeed;
  uniform float uBands;
  uniform float uTurb;
  uniform float uSpot;
  uniform float uIce;
  uniform vec3  uAtm;
  uniform float uAtmK;

  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vWorld;
  varying vec3 vView;

  ${NOISE}

  void main() {
    vec3 n = normalize(vObj);
    vec3 p = n + vec3(uSeed * 1.37, uSeed * 2.11, uSeed * 0.73);
    float lat = n.y;

    vec3 col = vec3(0.5);
    float spec = 0.0;
    float night = 0.0;

    // ---------- 0 : rocky (Mercury, Mars) ----------
    if (uType == 0) {
      float h = fbm(p * 3.0);
      float cr = ridged(p * 8.0);
      float fine = fbm(p * 28.0);
      col = mix(uA, uB, smoothstep(0.25, 0.75, h));
      col *= 0.65 + 0.55 * cr;
      col *= 0.85 + 0.3 * fine;
      // dark maria / crater floors
      col *= 1.0 - 0.35 * smoothstep(0.55, 0.75, fbm(p * 5.0 + 4.0));
      if (uIce > 0.5) {
        float cap = smoothstep(0.82, 0.92, abs(lat) + (fbm(p * 8.0) - 0.5) * 0.12);
        col = mix(col, vec3(0.93, 0.95, 1.0), cap);
      }
    }

    // ---------- 1 : Venus (thick swirling clouds) ----------
    else if (uType == 1) {
      vec3 q = p * 2.5;
      vec3 w = vec3(fbm3(q + uTime * 0.010), fbm3(q + 5.2), fbm3(q + 1.3));
      float c = fbm(q * 1.4 + w * 2.2 + vec3(0.0, uTime * 0.01, 0.0));
      col = mix(uA, uB, smoothstep(0.25, 0.80, c));
    }

    // ---------- 2 : Earth ----------
    else if (uType == 2) {
      float land = fbm(p * 2.2 + vec3(fbm3(p * 4.0) * 0.5));
      float isLand = smoothstep(0.50, 0.52, land);

      vec3 ocean = mix(vec3(0.005, 0.03, 0.14), vec3(0.03, 0.20, 0.46),
                       smoothstep(0.30, 0.50, land));
      float elev = smoothstep(0.52, 0.76, land);
      vec3 landc = mix(vec3(0.07, 0.25, 0.05), vec3(0.42, 0.34, 0.20), elev);
      float desert = smoothstep(0.55, 0.75, fbm(p * 5.0 + 3.0)) * (1.0 - abs(lat));
      landc = mix(landc, vec3(0.74, 0.62, 0.38), desert * 0.85);

      col = mix(ocean, landc, isLand);

      float ice = smoothstep(0.80, 0.92, abs(lat) + (fbm(p * 6.0) - 0.5) * 0.15);
      col = mix(col, vec3(0.93, 0.96, 1.0), ice);

      // moving clouds
      vec3 cp = p * 3.2 + vec3(uTime * 0.012, 0.0, 0.0);
      float cloud = smoothstep(0.50, 0.78, fbm(cp + fbm3(p * 6.0) * 0.7));
      col = mix(col, vec3(1.0), cloud * 0.88);

      spec = (1.0 - isLand) * (1.0 - cloud) * (1.0 - ice);
      night = isLand * smoothstep(0.58, 0.72, fbm(p * 20.0)) * (1.0 - cloud);
    }

    // ---------- 3 : gas / ice giants ----------
    else {
      float y = lat;
      float warp = (fbm3(p * vec3(3.0, 1.2, 3.0) + uTime * 0.004) - 0.5) * 0.22 * uTurb;
      float band = sin((y + warp) * uBands * 3.14159) * 0.5 + 0.5;
      float band2 = sin((y * 2.7 + warp * 1.5) * uBands * 3.14159 + 1.3) * 0.5 + 0.5;
      float fine = fbm(vec3(n.x * 7.0, y * 38.0, n.z * 7.0) + uSeed);
      float swirl = fbm(p * 9.0 + vec3(0.0, fbm3(p * 4.0) * 2.0, 0.0));

      col = mix(uA, uB, band * 0.7 + band2 * 0.3);
      col = mix(col, uC, smoothstep(0.45, 0.85, fine) * 0.45 * (0.3 + uTurb));
      col *= 0.9 + 0.2 * swirl;

      if (uSpot > 0.5) {
        float lon = atan(n.z, n.x);
        vec2 d = vec2((lon - 0.8) * 0.55, (y + 0.27) * 2.6);
        float s = exp(-dot(d, d) * 7.0);
        col = mix(col, vec3(0.62, 0.22, 0.10), s * 0.9);
      }
    }

    // ---------- lighting (sun at world origin) ----------
    vec3 N = normalize(vN);
    vec3 L = normalize(-vWorld);
    vec3 V = normalize(vView);
    float ndl = dot(N, L);
    float diff = smoothstep(-0.08, 0.35, ndl);
    diff = pow(max(ndl, 0.0), 0.85) * 0.75 + diff * 0.25;

    vec3 lit = col * (diff * 1.25 + 0.010);

    // city lights on the dark side
    lit += vec3(1.0, 0.72, 0.38) * night * smoothstep(0.08, -0.18, ndl) * 0.9;

    // ocean sun glint
    vec3 H = normalize(L + V);
    lit += vec3(1.0, 0.95, 0.85) * spec * pow(max(dot(N, H), 0.0), 110.0) * 0.9 * diff;

    // atmospheric limb glow
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    lit += uAtm * rim * uAtmK * smoothstep(-0.25, 0.5, ndl);

    gl_FragColor = vec4(lit, 1.0);

    #include <colorspace_fragment>
  }
`;

function PlanetMaterial({
  type,
  a = "#232323",
  b = "#444141",
  c = "#666666",
  seed = 0,
  bands = 10,
  turb = 1,
  spot = 0,
  ice = 0,
  atm = "#fefafa",
  atmK = 0,
}) {
  const ref = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uType: { value: type },
      uA: { value: new THREE.Color(a) },
      uB: { value: new THREE.Color(b) },
      uC: { value: new THREE.Color(c) },
      uSeed: { value: seed },
      uBands: { value: bands },
      uTurb: { value: turb },
      uSpot: { value: spot },
      uIce: { value: ice },
      uAtm: { value: new THREE.Color(atm) },
      uAtmK: { value: atmK },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    if (ref.current) ref.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <shaderMaterial
      ref={ref}
      uniforms={uniforms}
      vertexShader={PLANET_VERT}
      fragmentShader={PLANET_FRAG}
    />
  );
}

// ==========================================================
// ATMOSPHERE HALO (outer glow beyond the planet's edge)
// ==========================================================

const ATM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vN;
  varying vec3 vWorld;
  varying vec3 vView;

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vView);
    vec3 L = normalize(-vWorld);
    float glow = pow(max(-dot(N, V), 0.0), 4.5);
    float sunSide = smoothstep(-0.35, 0.45, dot(N, L));
    gl_FragColor = vec4(uColor, glow * sunSide * uStrength);
    #include <colorspace_fragment>
  }
`;

function Atmosphere({ radius, color, strength }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uStrength: { value: strength },
    }),
    [color, strength]
  );

  return (
    <mesh scale={1.12}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={PLANET_VERT}
        fragmentShader={ATM_FRAG}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ==========================================================
// SATURN RINGS (procedural bands + Cassini gap)
// ==========================================================

const RING_VERT = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vNW;
  varying vec3 vWorld;

  void main() {
    vObj = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const RING_FRAG = /* glsl */ `
  uniform float uInner;
  uniform float uOuter;
  varying vec3 vObj;
  varying vec3 vNW;
  varying vec3 vWorld;

  ${NOISE}

  void main() {
    float r = length(vObj.xy);
    float t = (r - uInner) / (uOuter - uInner);

    float coarse = vnoise(vec3(t * 40.0, 1.0, 2.0));
    float fine = vnoise(vec3(t * 220.0, 3.0, 4.0));
    float density = 0.35 + 0.45 * coarse + 0.35 * fine;

    // C ring faint, B ring dense, Cassini division, A ring
    density *= mix(0.35, 1.0, smoothstep(0.0, 0.22, t));
    density *= 1.0 - 0.95 * smoothstep(0.015, 0.0, abs(t - 0.64));
    density *= 1.0 - 0.7 * smoothstep(0.008, 0.0, abs(t - 0.93));

    float edge = smoothstep(0.0, 0.03, t) * smoothstep(1.0, 0.96, t);
    float alpha = clamp(density, 0.0, 1.0) * edge * 0.92;

    vec3 base = mix(vec3(0.55, 0.47, 0.34), vec3(0.88, 0.80, 0.64), coarse * 0.6 + fine * 0.4);

    vec3 L = normalize(-vWorld);
    float lightK = 0.25 + 0.75 * abs(dot(normalize(vNW), L));

    gl_FragColor = vec4(base * lightK * 1.15, alpha);

    #include <colorspace_fragment>
  }
`;

function Rings({ inner, outer }) {
  const uniforms = useMemo(
    () => ({ uInner: { value: inner }, uOuter: { value: outer } }),
    [inner, outer]
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 256, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={RING_VERT}
        fragmentShader={RING_FRAG}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ==========================================================
// MOON
// ==========================================================

function Moon({ size, distance, speed }) {
  const ref = useRef();
  const angle = useRef(1.2);

  useFrame((_, delta) => {
    angle.current += Math.min(delta, 0.05) * speed;
    if (ref.current) {
      ref.current.position.set(
        Math.cos(angle.current) * distance,
        Math.sin(angle.current * 0.5) * 0.08,
        Math.sin(angle.current) * distance
      );
      ref.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 48, 48]} />
      <PlanetMaterial type={0} a="#4b4a48" b="#a9a59d" seed={9} />
    </mesh>
  );
}

// ==========================================================
// ORBIT LINE
// ==========================================================

function Orbit({ radius }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.012, radius + 0.012, 256]} />
      <meshBasicMaterial
        color="#8fb4ff"
        transparent
        opacity={0.10}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ==========================================================
// PLANET DATA  (sizes/distances artistic scale, speed ~ Kepler)
// ==========================================================

const ORBIT_K = 2.2; // global speed multiplier

const PLANETS = [
  {
    name: "Mercury", distance: 5, size: 0.26, spin: 0.3, tilt: 0.0, incl: 0.12, start: 0.5,
    mat: { type: 0, a: "#4a4642", b: "#a29a8e", seed: 1 },
  },
  {
    name: "Venus", distance: 7.6, size: 0.55, spin: -0.05, tilt: 3.09, incl: 0.06, start: 2.1,
    mat: { type: 1, a: "#c98a3a", b: "#f0d9a0", seed: 2, atm: "#ffc880", atmK: 0.5 },
    halo: { color: "#ffcc88", strength: 0.7 },
  },
  {
    name: "Earth", distance: 10.6, size: 0.6, spin: 0.5, tilt: 0.41, incl: 0.0, start: 4.0,
    mat: { type: 2, seed: 3, atm: "#5aa0ff", atmK: 1.0 },
    halo: { color: "#4d9bff", strength: 1.7 },
    moon: { size: 0.16, distance: 1.15, speed: 0.9 },
  },
  {
    name: "Mars", distance: 14, size: 0.34, spin: 0.48, tilt: 0.44, incl: 0.03, start: 5.4,
    mat: { type: 0, a: "#5e2610", b: "#c9733f", seed: 4, ice: 1, atm: "#ffa070", atmK: 0.15 },
    halo: { color: "#ff9060", strength: 0.3 },
  },
  {
    name: "Jupiter", distance: 25, size: 1.75, spin: 1.1, tilt: 0.05, incl: 0.02, start: 0.4,
    mat: { type: 3, a: "#a9835e", b: "#e8d6bb", c: "#8a4f2c", seed: 5, bands: 14, turb: 1.2, spot: 1 },
  },
  {
    name: "Saturn", distance: 33, size: 1.45, spin: 1.0, tilt: 0.47, incl: 0.04, start: 2.6,
    mat: { type: 3, a: "#c9a86b", b: "#ecd9a8", c: "#a88a55", seed: 6, bands: 9, turb: 0.5 },
    rings: { inner: 1.9, outer: 3.5 },
  },
  {
    name: "Uranus", distance: 40, size: 0.95, spin: 0.6, tilt: 1.7, incl: 0.01, start: 3.9,
    mat: { type: 3, a: "#8fd5d8", b: "#b6eef0", c: "#76c0c8", seed: 7, bands: 5, turb: 0.15, atm: "#8fe0e8", atmK: 0.6 },
    halo: { color: "#8fe0e8", strength: 0.8 },
  },
  {
    name: "Neptune", distance: 46, size: 0.92, spin: 0.65, tilt: 0.5, incl: 0.03, start: 5.5,
    mat: { type: 3, a: "#2f4fd0", b: "#4f7bff", c: "#1f3590", seed: 8, bands: 7, turb: 0.6, atm: "#5f8cff", atmK: 0.6 },
    halo: { color: "#5f8cff", strength: 0.9 },
  },
];

function Body({ cfg }) {
  const orbitRef = useRef();
  const spinRef = useRef();
  const angle = useRef(cfg.start);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    angle.current += (dt * ORBIT_K) / Math.pow(cfg.distance, 1.5);
    if (orbitRef.current) {
      orbitRef.current.position.set(
        Math.cos(angle.current) * cfg.distance,
        0,
        Math.sin(angle.current) * cfg.distance
      );
    }
    if (spinRef.current) spinRef.current.rotation.y += dt * cfg.spin;
  });

  return (
    <group rotation={[cfg.incl, 0, 0]}>
      <Orbit radius={cfg.distance} />

      <group ref={orbitRef}>
        <group rotation={[0, 0, cfg.tilt]}>
          <mesh ref={spinRef}>
            <sphereGeometry args={[cfg.size, 96, 96]} />
            <PlanetMaterial {...cfg.mat} />
          </mesh>

          {cfg.halo && (
            <Atmosphere radius={cfg.size} color={cfg.halo.color} strength={cfg.halo.strength} />
          )}
          {cfg.rings && <Rings inner={cfg.rings.inner} outer={cfg.rings.outer} />}
          {cfg.moon && <Moon {...cfg.moon} />}
        </group>
      </group>
    </group>
  );
}

// ==========================================================
// ASTEROID BELT (Mars <-> Jupiter)
// ==========================================================

function AsteroidBelt({ count = 2200, inner = 17.5, outer = 21.5 }) {
  const meshRef = useRef();
  const groupRef = useRef();

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = inner + Math.random() * (outer - inner);
      dummy.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.7, Math.sin(a) * r);
      dummy.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      const s = 0.02 + Math.pow(Math.random(), 3) * 0.1;
      dummy.scale.set(s * (0.7 + Math.random()), s * (0.7 + Math.random()), s * (0.7 + Math.random()));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, inner, outer]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += Math.min(delta, 0.05) * 0.006;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8a8178" roughness={1} metalness={0} flatShading />
      </instancedMesh>
    </group>
  );
}

// ==========================================================
// DEEP SPACE (milky way band + faint nebula)
// ==========================================================

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  varying vec3 vDir;
  ${NOISE}

  void main() {
    vec3 d = normalize(vDir);

    // tilted galactic plane
    vec3 axis = normalize(vec3(0.35, 1.0, 0.25));
    float h = dot(d, axis);
    float band = exp(-h * h * 9.0);

    float cloud = fbm(d * 3.5);
    float detail = fbm(d * 9.0 + 4.0);
    float dust = smoothstep(0.45, 0.75, fbm(d * 6.0 + 11.0));

    vec3 coolCol = vec3(0.10, 0.14, 0.30);
    vec3 warmCol = vec3(0.30, 0.17, 0.12);
    vec3 col = mix(coolCol, warmCol, smoothstep(0.35, 0.8, cloud));

    float glow = band * (0.25 + 0.75 * cloud) * (0.6 + 0.6 * detail);
    col *= glow * 0.55;
    col *= 1.0 - 0.7 * dust * band;       // dark dust lanes
    col += vec3(0.004, 0.006, 0.014);     // deep space tint

    gl_FragColor = vec4(col, 1.0);

    #include <colorspace_fragment>
  }
`;

function DeepSpace() {
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[900, 64, 64]} />
      <shaderMaterial
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ==========================================================
// SCENE
// ==========================================================

function SpaceScene() {
  return (
    <>
      <color attach="background" args={["#000004"]} />

      <DeepSpace />

      {/* do layer ke stars: chhote dense + bade bright */}
      <Stars radius={300} depth={120} count={12000} factor={5} saturation={0.15} fade speed={0.20} />
      <Stars radius={500} depth={200} count={6000} factor={9} saturation={0.4} fade speed={0.1} />

      <ambientLight intensity={0.05} />

      <Sun />

      {PLANETS.map((p) => (
        <Body key={p.name} cfg={p} />
      ))}

      <AsteroidBelt />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.25}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.62}
      />
    </>
  );
}

// ==========================================================
// SPACE BACKGROUND COMPONENT
// ==========================================================

function SpaceBackground() {
  return (
    <div className="space-background">
      <Canvas
        camera={{ position: [0, 24, 60], fov: 50, near: 0.1, far: 3000 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <SpaceScene />
      </Canvas>

      <div className="space-background-overlay"></div>
    </div>
  );
}

export default SpaceBackground;