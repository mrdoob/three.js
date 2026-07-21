import * as THREE from 'three';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, controls, teapot, grid, dragging = false;

async function init() {

	//console.log( 'INIT' );

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
	controls.addEventListener( 'start', () => {

		dragging = true;

	} );
	controls.addEventListener( 'end', () => {

		dragging = false;

	} );

	const geometry = new TeapotGeometry( 2, 10 );
	const material = new THREE.NodeMaterial();
	teapot = new THREE.Mesh( geometry, material );

	grid = new THREE.GridHelper( 20, 20, 0x666666, 0x333333 );
	grid.position.y = - 2;

	scene.add( teapot );
	scene.add( grid );

}

function update() {

	if ( ! dragging ) {

		teapot.rotation.y += 0.01;

	}

	controls.update();

	renderer.render( scene, camera );

}

function resize( width, height ) {

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

}

function dispose() {

	scene.remove( teapot );
	scene.remove( grid );
	controls.dispose();

}

function debug() {

	return { scene, camera, object: teapot };

}

export { scene, camera, controls, teapot, grid, dragging, debug };
