import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, ball;
let speed = new THREE.Vector3(0, 0, 0);

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);
  const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(helper);

  // Add a ground plane
  const textureLoader = new THREE.TextureLoader();
  const groundTexture = await textureLoader.loadAsync('assets/grass.jpg'); // Ensure you have a grass texture
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(100, 100);

  const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
  const groundGeometry = new THREE.PlaneGeometry(500, 500);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
  ground.position.y = -0.5; // Adjust y position to be slightly below the sphere's start position
  scene.add(ground);

  // Load ball texture and create the ball
  textureLoader.load('assets/rocks.jpg', function(texture) {
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture });
    ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(ball);
  });

  // Event listeners for keyboard input
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  animate();
};


function onKeyDown(event) {
  switch(event.keyCode) {
    case 37: // left
      speed.x = -0.1;
      break;
    case 39: // right
      speed.x = 0.1;
      break;
    case 38: // up
      speed.z = -0.1;
      break;
    case 40: // down
      speed.z = 0.1;
      break;
  }
}

function onKeyUp(event) {
  switch(event.keyCode) {
    case 37: // left
    case 39: // right
      speed.x = 0;
      break;
    case 38: // up
    case 40: // down
      speed.z = 0;
      break;
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (ball) {
    // Move and roll the ball
    ball.position.add(speed);
    if (speed.length() > 0) {
      const rotationAxis = new THREE.Vector3(-speed.z, 0, speed.x).normalize();
      const angularVelocity = speed.length() / 0.5; // Angular velocity depends on speed and radius of the ball
      ball.rotateOnAxis(rotationAxis, angularVelocity * 0.05); // Modify the rotation factor as needed
    }
  }

  // Update the camera to follow the ball
  camera.position.x = ball.position.x + 5; // Adjust x-offset as needed
  camera.position.y = ball.position.y + 5; // Adjust y-offset as needed
  camera.position.z = ball.position.z + 5; // Adjust z-offset as needed
  camera.lookAt(ball.position);

  renderer.render(scene, camera);
}
