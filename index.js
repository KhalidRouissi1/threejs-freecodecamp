import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

// Set the width and height
const w = window.innerWidth;
const h = window.innerHeight;

// Create the renderer
const render = new THREE.WebGLRenderer({ antialias: true });
render.setSize(w, h);

// Create the canvas
document.body.appendChild(render.domElement);

// Setup the camera params
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10;

// Setup the camera
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

// Create the scene
const scene = new THREE.Scene();

const controls = new OrbitControls(camera, render.domElement);
controls.dampingFactor = 0.03;

// Define the geometry
const geo = new THREE.IcosahedronGeometry(1.0, 2);

// Create the Material and its parameters
const mat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  flatShading: true,
});

// Put on the texture or mesh
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const wirMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});

const wireMesh = new THREE.Mesh(geo, wirMat);
wireMesh.scale.setScalar(1.001);
mesh.add(wireMesh);

const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

function animate(t = 0) {
  requestAnimationFrame(animate);
  mesh.rotation.y = t * 0.0001;
  render.render(scene, camera);
  controls.update();
}
animate();
