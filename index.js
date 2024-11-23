import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Set the width and height
const w = window.innerWidth;
const h = window.innerHeight;

// Create the renderer
const render = new THREE.WebGLRenderer({ antialias: true });
render.setSize(w, h);
document.body.appendChild(render.domElement);

// Setup the camera
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
camera.position.z = 2;

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (-23.4 * Math.PI) / 180; // Earth tilt

// Add controls
const controls = new OrbitControls(camera, render.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
controls.screenSpacePanning = false; // Prevents panning when zoomed in

// Fresnel material (simple version)
function getFresnelMat({ rimHex = 0x0088ff, facingHex = 0x000000 } = {}) {
  const fresnelShader = {
    uniforms: {
      facingColor: { value: new THREE.Color(facingHex) },
      rimColor: { value: new THREE.Color(rimHex) },
      intensity: { value: 1.0 },
      cameraPosition: { value: camera.position },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform vec3 facingColor;
      uniform vec3 rimColor;
      uniform float intensity;
      uniform vec3 cameraPosition;
      void main() {
        float facing = dot(vNormal, normalize(cameraPosition - vPosition));
        float rim = 1.0 - smoothstep(0.4, 0.6, facing);
        gl_FragColor = mix(facingColor, rimColor, rim * intensity);
      }
    `,
  };

  return new THREE.ShaderMaterial(fresnelShader);
}

// Starfield function
function getStarfield({ numStars = 500 } = {}) {
  const verts = [];
  const colors = [];
  for (let i = 0; i < numStars; i++) {
    const radius = Math.random() * 25 + 25;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    verts.push(x, y, z);

    const col = new THREE.Color().setHSL(0.6, 0.2, Math.random());
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
  });

  return new THREE.Points(geo, mat);
}

const stars = getStarfield({ numStars: 1000 });
scene.add(stars);

// Earth geometry
const detail = 12;
const geo = new THREE.IcosahedronGeometry(1, detail);
const loader = new THREE.TextureLoader();
const mat = new THREE.MeshStandardMaterial({
  map: loader.load("earthmap1k.jpg"),
});

const fresneMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geo, fresneMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const cloudMat = new THREE.MeshStandardMaterial({
  map: loader.load("04_earthcloudmap.jpg"),
  blending: THREE.AdditiveBlending,
});

const cloudMesh = new THREE.Mesh(geo, cloudMat);
cloudMesh.scale.setScalar(1.003);
earthGroup.add(cloudMesh);

const lightMat = new THREE.MeshStandardMaterial({
  map: loader.load("03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightMesh = new THREE.Mesh(geo, lightMat);
earthGroup.add(lightMesh);

const earthMesh = new THREE.Mesh(geo, mat);
earthGroup.add(earthMesh);
scene.add(earthGroup);

// Lighting
const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-2, -0.5, 2);
scene.add(sunLight);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate earth and elements
  earthMesh.rotation.y += 0.002;
  lightMesh.rotation.y += 0.002;
  cloudMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;

  // Update controls
  controls.update();

  // Render the scene
  render.render(scene, camera);
}

animate();
