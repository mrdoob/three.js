import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, controls, grid;

async function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 50, renderer.domElement.clientWidth / renderer.domElement.clientHeight, 0.1, 100 );
	camera.position.set( 0, 5, 10 );
	camera.lookAt( 0, 0, 0 );

	const dirLight = new THREE.DirectionalLight( 0xffffff, 2.0 );
	dirLight.position.set( 5, 10, 5 );
	scene.add( dirLight );

	const ambientLight = new THREE.AmbientLight( 0x404040, 1.5 );
	scene.add( ambientLight );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.minDistance = 2;
	controls.maxDistance = 20;

	grid = new THREE.GridHelper( 20, 20, 0x666666, 0x333333 );
	grid.position.y = - 2;

	scene.add( grid );

}

function update() {

	controls.update();

	renderer.render( scene, camera );

}

function resize( width, height ) {

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

}

function dispose() {

	scene.remove( grid );
	controls.dispose();

}

function debug() {

	return { scene, camera, object: grid };

}

export { scene, camera, controls, grid, debug };
