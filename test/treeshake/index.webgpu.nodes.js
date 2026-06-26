import * as THREE from '../../src/Three.WebGPU.Nodes.js';

let camera, scene, renderer;

init();

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );

	scene = new THREE.Scene();

	renderer = new THREE.WebGPURenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animation );
	document.body.appendChild( renderer.domElement );

}

function animation( ) {

	renderer.render( scene, camera );

}
