import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, ball;
let speed = new THREE.Vector3(0, 0, 0);
let objects = [];
let score = 0;
let gameDuration = 20; // Game duration in seconds
let gameActive = true;

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, -10);
  camera.lookAt(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 10, 5);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
  pointLight.position.set(0, 2, 2);
  scene.add(pointLight);

  const textureLoader = new THREE.TextureLoader();
  const groundTexture = await textureLoader.loadAsync('assets/grass.jpg');
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(100, 100);

  const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
  const groundGeometry = new THREE.PlaneGeometry(500, 500);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  scene.add(ground);

  textureLoader.load('assets/rocks.jpg', function(texture) {
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture });
    ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
    ball.position.set(0, 1, 0);
    scene.add(ball);
  });

  createObjects(50); // Create 50 random objects

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  setTimeout(endGame, gameDuration * 1000); // End the game after the timer expires
  animate();
};

function createObjects(count) {
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.25, 32, 32),
    new THREE.ConeGeometry(0.3, 1, 32),
    new THREE.TorusGeometry(0.3, 0.1, 16, 100)
  ];

  for (let i = 0; i < count; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      Math.random() * 100 - 50, // Random x position from -50 to 50
      0.5,
      Math.random() * 100 - 50 // Random z position from -50 to 50
    );
    objects.push(mesh);
    scene.add(mesh);
  }
}

function onKeyDown(event) {
  if (!gameActive) return;
  switch (event.keyCode) {
    case 37: speed.x = -0.05; break;
    case 39: speed.x = 0.05; break;
    case 38: speed.z = -0.05; break;
    case 40: speed.z = 0.05; break;
  }
}

function onKeyUp(event) {
  if (!gameActive) return;
  switch (event.keyCode) {
    case 37:
    case 39: speed.x = 0; break;
    case 38:
    case 40: speed.z = 0; break;
  }
}

function animate() {
  if (!gameActive) return;
  requestAnimationFrame(animate);

  if (ball) {
    ball.position.add(speed);
    if (speed.length() > 0) {
      let rotationAxis = new THREE.Vector3().crossVectors(speed, new THREE.Vector3(0, 1, 0)).normalize();
      let distanceTravelled = speed.length();
      let ballRadius = ball.geometry.parameters.radius;
      let angularVelocity = distanceTravelled / (2 * Math.PI * ballRadius);
      ball.rotateOnAxis(rotationAxis, angularVelocity);
    }

    checkCollisions();
  }

  updateCamera();
  renderer.render(scene, camera);
}

function checkCollisions() {
  objects = objects.filter(obj => {
    const objBoundingBox = new THREE.Box3().setFromObject(obj);
    const ballBoundingBox = new THREE.Box3().setFromObject(ball);
    if (objBoundingBox.intersectsBox(ballBoundingBox)) {
      score += 10; // Increase score
      const newRadius = ball.geometry.parameters.radius + 0.02;
      ball.geometry.dispose();
      ball.geometry = new THREE.SphereGeometry(newRadius, 32, 32);
      scene.remove(obj);
      return false;
    }
    return true;
  });
}

function updateCamera() {
  camera.position.x = ball.position.x + 5; // Adjust x-offset as needed
  camera.position.y = ball.position.y + 5; // Adjust y-offset as needed
  camera.position.z = ball.position.z + 5; // Adjust z-offset as needed
  camera.lookAt(ball.position);
}

function endGame() {
  gameActive = false;
  alert(`Game Over! Your score: ${score}`);
}

document.body.onload = init;
