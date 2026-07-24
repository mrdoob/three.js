import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { Fn, float, fract, fwidth, abs, saturate, max, smoothstep, length, positionWorld, vec4, reflector, pass } from 'three/tsl';

let scene, camera, controls, defaultPass, renderPipeline, floor, reflection, dragging = false;

const gridTexture = Fn( ( [ coord, lineWidth = float( 0.01 ), dotSize = float( 0.03 ) ] ) => {

	const g = fract( coord );
	const fw = fwidth( coord );
	const gx = abs( g.x.sub( 0.5 ) );
	const gy = abs( g.y.sub( 0.5 ) );

	const lineX = saturate( lineWidth.sub( gx ).div( fw.x ).add( 0.5 ) );
	const lineY = saturate( lineWidth.sub( gy ).div( fw.y ).add( 0.5 ) );
	const lines = max( lineX, lineY );

	const squareDist = max( gx, gy );
	const aa = max( fw.x, fw.y );
	const dots = smoothstep( dotSize.add( aa ), dotSize.sub( aa ), squareDist );

	return max( dots, lines );

} );

function resetScene() {

	scene.clear();

	scene.add( reflection.target );
	scene.add( floor );

	scene.fogNode = null;
	scene.backgroundNode = null;

	floor.visible = true;

	camera.position.set( 2, 3, 4 );
	camera.lookAt( 0, 1, 0 );

	controls.target.set( 0, 1, 0 );
	controls.update();

	renderPipeline.outputNode = defaultPass;
	renderPipeline.needsUpdate = true;

}

async function init() {

	if ( scene ) {

		resetScene();
		return;

	}

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45, renderer.domElement.clientWidth / renderer.domElement.clientHeight, 0.1, 100 );
	camera.position.set( 2, 3, 4 );

	defaultPass = pass( scene, camera );

	renderPipeline = new THREE.RenderPipeline( renderer );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.minDistance = 2;
	controls.maxDistance = 20;
	controls.target.set( 0, 1, 0 );
	controls.addEventListener( 'start', () => dragging = true );
	controls.addEventListener( 'end', () => dragging = false );

	// Ground plane with procedural grid (glossy reflective showroom floor)
	const floorMaterial = new THREE.MeshStandardNodeMaterial( { roughness: 0.6, metalness: 0.8 } );

	const fade = Fn( ( [ radius = float( 10.0 ), falloff = float( 1.0 ) ] ) => {

		return smoothstep( radius, radius.sub( falloff ), length( positionWorld ) );

	} );

	// Planar Reflector for glossy floor reflections
	reflection = reflector( { resolutionScale: 1 } );
	reflection.target.rotateX( - Math.PI / 2 );

	const gridColor = vec4( 0.45, 0.45, 0.45, 1.0 );
	const baseColor = vec4( 0.08, 0.08, 0.08, 1.0 ); // Neutral dark metallic base

	// Combine procedural grid, dark showroom base, and mirror reflections
	const floorColor = gridTexture( positionWorld.xz, 0.007, 0.03 ).mix( baseColor, gridColor ).add( reflection.mul( 0.25 ) );
	floorMaterial.colorNode = floorColor;
	floorMaterial.transparent = true;
	floorMaterial.opacityNode = fade( 25.0, 15.0 );

	floor = new THREE.Mesh( new THREE.CircleGeometry( 40 ), floorMaterial );
	floor.rotation.x = - Math.PI / 2;
	floor.renderOrder = - 1;
	floor.receiveShadow = true;

	// Load environment map
	const texture = await new HDRLoader()
		.setPath( '../examples/textures/equirectangular/' )
		.loadAsync( 'ferndale_studio_04_1k.hdr' );

	texture.mapping = THREE.EquirectangularReflectionMapping;
	scene.environment = texture;
	scene.environmentIntensity = 0.25; // Soft HDR reflections

	// Blur and dim background environment for cinematic look
	scene.background = texture;
	scene.backgroundBlurriness = 0.65;
	scene.backgroundIntensity = 0.15;

	resetScene();

}

function update() {

	controls.update();
	renderPipeline.render();

}

function resize( width, height ) {

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

}

function dispose() {

	// Implement dispose

}

function debug() {

	return { scene, camera, object: floor };

}

export { scene, camera, controls, defaultPass, renderPipeline, floor, dragging, resetScene, debug };
