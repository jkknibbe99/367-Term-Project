import * as THREE from 'three';  // import Three.js

import {OrbitControls} from './js/OrbitControls.js';  // import Orbit controls script
import {GLTFLoader} from './js/GLTFLoader.js';  // import GLTFLoader.js
import {DRACOLoader} from './js/DRACOLoader.js';  // import DRACOLoader.js
import {Water} from './js/Water.js';  // import Water shader
import {Sky} from './js/Sky.js';  // import Sky shader

let container, stats;
let camera, scene, renderer;
let controls, water, box, boat, terrain;
let sun, sun_parameters, updateSun, sun_height_slider_val, sun_azimuth_slider_val;
let manual_sun_change = false;


// Run init() and start animation
init();
setTimeout(() => {
    animate();
}, 1000)


// Initialize everything
function init() {

    // Find the container div in the HTML
    container = document.getElementById('three-container');

    // Create the renderer and add place in the container
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;  // Needed for gltf imports
    container.appendChild(renderer.domElement);

    // Create the scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

    // Sun
    sun = new THREE.Vector3();

    // Water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = - Math.PI / 2;
    scene.add(water);

    // Skybox
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    
    // Sun settings
    sun_parameters = {
        auto_move: true,
        elevation: -3,
        azimuth: 180
    };
    // init the start value of the sun sliders
    sun_height_slider_val = document.getElementById('sun-height-slider').value;
    sun_azimuth_slider_val = document.getElementById('sun-azimuth-slider').value;
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    // Update the sun object
    updateSun = function() {

        const phi = THREE.MathUtils.degToRad(90 - sun_parameters.elevation);
        const theta = THREE.MathUtils.degToRad(sun_parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        scene.environment = pmremGenerator.fromScene(sky).texture;

    }
    updateSun();

    // Boat
    var loader = new GLTFLoader();
    loader.load(
    "./gltf/boat.glb",
    function (gltf) {
                        var scale = 5.6;
    boat = gltf.scene.children[0];
    boat.rotation.set(0, -1.5708, 0);
    boat.scale.set(scale, scale, scale);
    boat.position.set(0, .1, 0);
    boat.castShadow = true;
    boat.receiveShadow = true;
    scene.add(boat)
                    },
    );

    // Islands
    var loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/js/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load("./gltf/terrain.glb", function (gltf) {
        var scale = 400;
        terrain = gltf.scene.children[0];
        terrain.scale.set(scale, scale, scale);
        terrain.position.set(1000, -0.1, 0);
        terrain.receiveShadow = true;
        terrain.castShadow = true;
        // Island texture
        let island_texture = new THREE.TextureLoader().load('textures/forest_texture2.png');
        let island_material = new THREE.MeshStandardMaterial({map: island_texture, metalness: 1, roughness: 2 });
        terrain.material = island_material;
        scene.add(terrain);
        }
    );

    // Orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.update();

    // Add event listener for browser window resize
    window.addEventListener('resize', onWindowResize);

}


// Adjust camera and view window when browser window is resized
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}


// Animate the scene
function animate() {

    // check mode
    if (mode == "drive") {
        // Update camera controls
        controls.target.set(boat.position.x, boat.position.y, boat.position.z);
        controls.target.y += 10;
        controls.maxDistance = 70;
        camera.position.y = 20;
        controls.update();
    } else if (mode == "view") {
        controls.maxDistance = 200;
        controls.update();
    }

    // Move boat
    updateBoatSpeed();
    updateBoatTurn();
    // direction vector for movement
    boat.rotation.y += THREE.MathUtils.degToRad(boat_turn_deg);
    var matrix = new THREE.Matrix4();
    matrix.extractRotation(boat.matrix);
    var direction = new THREE.Vector3(0, 0, 1);
    direction = new THREE.Vector3(0, 0, -1).applyQuaternion(boat.quaternion);
    // scalar to simulate speed
    var vector = direction.multiplyScalar(boat_speed, boat_speed, boat_speed);
    boat.position.x += vector.x;
    boat.position.y += vector.y;
    boat.position.z += vector.z;

    // Boat bobbing
    // const time = performance.now() * 0.001;
    // boat.position.y = Math.sin(time) * 0.5 - 0.25;

    // Water movement
    water.material.uniforms['time'].value += 1.0 / 60.0;

    // Update Sun location
    // Elevation
    let elevation_slider = document.getElementById('sun-height-slider');
    var curr_sun_height_slider_val = parseInt(elevation_slider.value);
    if (sun_height_slider_val != curr_sun_height_slider_val) {
        sun_height_slider_val = curr_sun_height_slider_val;
        sun_parameters.elevation = sun_height_slider_val;
        updateSun();
    } else
    if (document.getElementById('sun-move').checked && !manual_sun_change) {
        sun_parameters.elevation += 0.005;
        updateSun();
        if (Math.abs(parseInt(sun_parameters.elevation) - sun_parameters.elevation) < 0.01) {
            elevation_slider.value = sun_parameters.elevation;
        }
    }
    // Azimuth
    let azimuth_slider = document.getElementById('sun-azimuth-slider');
    var curr_sun_azimuth_slider_val = parseInt(azimuth_slider.value);
    if (sun_azimuth_slider_val != curr_sun_azimuth_slider_val) {
        sun_azimuth_slider_val = curr_sun_azimuth_slider_val;
        sun_parameters.azimuth = sun_azimuth_slider_val;
        updateSun();
    }

    // render scene
    render();

    // Callback to animate
    requestAnimationFrame(animate);
}


// Render the scene
function render() {
    renderer.render(scene, camera);
}
