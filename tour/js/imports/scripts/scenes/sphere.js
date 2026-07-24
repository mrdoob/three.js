import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const timer = new THREE.Timer();

let scene, camera, controls, model, grid, dragging = false;

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

	const geometry = new THREE.SphereGeometry( 3, 64, 64 );
	const material = new THREE.NodeMaterial();
	model = new THREE.Mesh( geometry, material );

	grid = new THREE.GridHelper( 20, 20, 0x666666, 0x333333 );
	grid.position.y = - 3;

	scene.add( model );
	scene.add( grid );

}

function update() {

	timer.update();

	if ( ! dragging ) {

		const delta = timer.getDelta();

		model.rotation.y += .1 * delta;

	}

	controls.update();

	renderer.render( scene, camera );

}

function resize( width, height ) {

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

}

function dispose() {

	scene.remove( model );
	scene.remove( grid );
	controls.dispose();

}

function debug() {

	return { scene, camera, object: model };

}

export { scene, camera, controls, model, grid, dragging, debug };
