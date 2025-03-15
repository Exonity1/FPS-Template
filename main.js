import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
//import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
//import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
//import { SSRPass } from 'three/addons/postprocessing/SSRPass.js';
//import { TAARenderPass } from 'three/addons/postprocessing/TAARenderPass.js';
import { LoaderHelper } from './LoaderHelper.js';


// Initialisie the time variables for updateFPS() 
let lastTime = Date.now(); 
let deltaTime = 0;
let fps = 0;
let keys = {w: false, s: false, a: false, d: false, shift: false, space: false};
//let loadedclass = new LoaderHelper(0, hideLoadingScreenAndStart);
//Intialise the general variables 



window.addEventListener('resize', onWindowResize, false);
const switchElement1 = document.getElementById('mySwitch1');

const renderer = new THREE.WebGLRenderer({ antialias: true, shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap } });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
world.solver.iterations = 20;
world.solver.tolerance = 0.001;
world.allowSleep = false;
const gLTFloader = new GLTFLoader();
const cannonDebugger = new CannonDebugger(scene, world, {})
document.body.appendChild(renderer.domElement);



//Camera and composer
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
camera.position.set(10,5,10);
camera.lookAt(0,0,0);
const controls = new OrbitControls(camera, renderer.domElement);

startFunctions();

function innitPhysics(){
    
  
}















// Create a basic plane with Cannon.js
const planeBody = new CANNON.Body({
    mass: 0, // Static body
    shape: new CANNON.Plane(),
    material: new CANNON.Material({ friction: 0.5, restitution: 0.3 })
});
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotate plane to be horizontal
world.addBody(planeBody);

// Create a basic plane with Three.js
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.rotation.x = -Math.PI / 2; // Rotate plane to be horizontal
scene.add(planeMesh);


let Player = innitPlayer();

Player = { body: Player.body, mesh: Player.mesh , speed: 0};


function innitPlayer(){
    const cubeBody = new CANNON.Body({
        mass: 80, // Dynamic body
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)), // Half-extents: 1m wide, 2m tall
        material: new CANNON.Material({ friction: 0.3, restitution: 0.1 }),
        linearDamping: 0.1 // Add some damping to prevent excessive sliding
    });
    cubeBody.position.set(0, 5, 0); // Initial position
    
    // Fix the centerOfMassOffset syntax - properly create a CANNON.Vec3
    cubeBody.centerOfMassOffset = new CANNON.Vec3(0, -0.9, 0); // Lower the center of mass
    
    // Don't use fixedRotation: true as it blocks ALL rotation
    // Instead, selectively block rotation on X and Z axes but allow Y-axis rotation
    cubeBody.angularFactor.set(0, 1, 0); // Block X and Z rotation, allow Y rotation
    
    cubeBody.updateMassProperties(); // Update mass properties after changing angular factor
    
    // Add some angular damping to prevent excessive spinning
    cubeBody.angularDamping = 0.5;
    
    world.addBody(cubeBody);
    
    const cubeGeometry = new THREE.BoxGeometry(1, 2, 1); // Full dimensions: 1m wide, 2m tall
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.castShadow = true;
    scene.add(cubeMesh);

    return { body: cubeBody, mesh: cubeMesh };
}

function handleKeyDown(event) {
    if (event.key === 'w') keys.w = true;
    if (event.key === 's') keys.s = true;
    if (event.key === 'a') keys.a = true;
    if (event.key === 'd') keys.d = true;
    if (event.key === 'Shift') keys.shift = true;
    if(event.key === ' ') keys.space = true;
}

function handleKeyUp(event) {
    if (event.key === 'w') keys.w = false;
    if (event.key === 's') keys.s = false;
    if (event.key === 'a') keys.a = false;
    if (event.key === 'd') keys.d = false;
    if (event.key === 'Shift') keys.shift = false;
    if(event.key === ' ') keys.space = false;
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);


function updatePlayerControls() {
    let PhysicsBody = Player.body;
    const force = Player.speed; // Use the player speed for force magnitude

    // Forward/Backward movement
    if (keys.w && !keys.s) {
        PhysicsBody.applyForce(new CANNON.Vec3(0, 0, -force), new CANNON.Vec3(0, 0, 0));
    }
    if (keys.s && !keys.w) {
        PhysicsBody.applyForce(new CANNON.Vec3(0, 0, force), new CANNON.Vec3(0, 0, 0));
    }
    if (keys.w && keys.s) {
        // Cancel out - do nothing when both keys are pressed
    }
    if (!keys.w && !keys.s) {
        // Add friction/damping for Z axis
        PhysicsBody.velocity.z *= 0.9; // Reduce velocity by 10% each frame
    }

    // Left/Right movement
    if (keys.a && !keys.d) {
        PhysicsBody.applyForce(new CANNON.Vec3(-force, 0, 0), new CANNON.Vec3(0, 0, 0));
    }
    if (keys.d && !keys.a) {
        PhysicsBody.applyForce(new CANNON.Vec3(force, 0, 0), new CANNON.Vec3(0, 0, 0));
    }
    if (keys.a && keys.d) {
        // Both keys pressed - do nothing
    }
    if (!keys.a && !keys.d) {
        // Add friction/damping for X axis
        PhysicsBody.velocity.x *= 0.9; // Reduce velocity by 10% each frame
    }

    // Jump if space is pressed and player is on ground
    if (keys.space) {
        // Simple check if player is near ground (y close to 1.0)
        // You might want to implement proper ground detection
        //if (Math.abs(PhysicsBody.position.y - 1.0) < 0.5) {
            PhysicsBody.applyImpulse(new CANNON.Vec3(0, 30, 0), new CANNON.Vec3(0, 0, 0));
        //}
    }

    // Set speed based on shift key (sprint)
    if (keys.shift) {
        Player.speed = 1000;
    } else {
        Player.speed = 500;
    }
    
    // Limit maximum velocity to prevent excessive speed
    const velocity = PhysicsBody.velocity;
    const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    //console.log(horizontalSpeed);
    
    
}









async function loadBackgroundScene(){
    environment = await loadModel('models/breakerBackground1.glb');
    scene.add(environment);
    loadedclass.add();
}


animate();

function animate() {
    requestAnimationFrame(animate);
    cannonDebugger.update();
    
    world.step(1 / 60, deltaTime, 10);
    
    composer.render();
    //renderer.render(scene, camera);
    
    updatePlayerControls();
    controls.update();
    syncBodies();
    //if (switchElement1.checked)     
    updateFPS();
}






function syncBodies(){
    syncObjectWithBody(Player.mesh, Player.body);
    
}

   
function updateFPS() {
    const now = Date.now();
    deltaTime = (now - lastTime) / 1000; // Zeit in Sekunden
    lastTime = now;

    if (deltaTime > 0) {
        fps = Math.round(1 / deltaTime); // FPS berechnen
    }

    document.getElementById('fpsCounter').textContent = `FPS: ${fps}`;
}

function loadHDRI(path) {

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const hdriLoader = new RGBELoader();

    hdriLoader.load(path, function(texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        texture.dispose();
        pmremGenerator.dispose();
        scene.environment = envMap;
        scene.background = envMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.3;
    });

}

function syncObjectWithBody(threeObject, cannonBody) {
    threeObject.position.copy(cannonBody.position);
    threeObject.quaternion.copy(cannonBody.quaternion);
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    //cameraPOV.aspect = width / height;
    //ameraPOV.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    composer.setSize(width, height);
    //composerPOV.setSize(width, height);
    //SSAOPass.setSize(width, height);
    //ssaoPassPOV.setSize(width, height);
    //ssrPass.setSize(width, height);
    //ssrPassPOV.setSize(width, height);
}




function errorAlert(){
    
}

async function loadModel(path) {
    try {
        const gltf = await gLTFloader.loadAsync(path, refreshLoadingScreen);
        console.log("Model loaded");
        let model = gltf.scene;
        model.castShadow = true;
        model.receiveShadow = true;
        return model;
    } catch (error) {
        console.log('An error happened', error);
        errorAlert();
        throw error;
    }
}

function startFunctions(){
    
    //loadBackgroundScene();
    loadHDRI('textures/hdri/daysky.hdr');
    createSunLight();
}

//document.getElementById('resetButton').addEventListener('click', resetVelocity);

createSunLight();

function createSunLight(){
    const sunLight = new THREE.DirectionalLight(0x5a729e, 6.5);
    sunLight.position.set(10, 10, 10);
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.near = 0.100;
    sunLight.shadow.camera.far = 100;
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
}