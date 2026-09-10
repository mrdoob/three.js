import { PerspectiveCamera, Scene, WebGPURenderer } from '../../build/three.webgpu.js';
import { color } from '../../build/three.tsl.js';

let camera, scene, renderer;

init();

function init() {

	camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );

	scene = new Scene();
	scene.backgroundNode = color( 0x000000 );

	renderer = new WebGPURenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animation );
	document.body.appendChild( renderer.domElement );

}

function animation( ) {

	renderer.render( scene, camera );

}
