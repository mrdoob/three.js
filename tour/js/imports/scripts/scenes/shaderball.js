import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { Fn, float, fract, fwidth, abs, saturate, max, smoothstep, length, positionWorld, positionLocal, vec4, reflector, pass } from 'three/tsl';

let scene, camera, controls, defaultPass, renderPipeline, prefab, previewMesh, calibrationMesh, floor, reflection, dragging = false;
let model;

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

	scene.fogNode = null;
	scene.backgroundNode = null;

	floor.visible = true;

	camera.position.set( 2, 3, 4 );
	camera.lookAt( 0, 1, 0 );

	controls.target.set( 0, 1, 0 );
	controls.update();

	prefab.rotation.set( 0, 0, 0 );

	previewMesh.material.dispose();
	calibrationMesh.material.dispose();

	previewMesh.material = new THREE.MeshStandardNodeMaterial( { roughness: 0.8, metalness: 0.2 } );

	// White checker calibration board material
	const calibMaterial = new THREE.MeshStandardNodeMaterial( { roughness: 0.5, metalness: 0.0 } );
	const calibGridColor = vec4( 0.25, 0.25, 0.25, 1.0 ); // Darker crisp grey lines
	const calibBaseColor = vec4( 0.95, 0.95, 0.95, 1.0 ); // Clean off-white squares
	calibMaterial.colorNode = gridTexture( positionLocal.xy.mul( 10.0 ), 0.02, 0.0 ).mix( calibBaseColor, calibGridColor );

	calibrationMesh.material = calibMaterial;

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
	scene.add( reflection.target );

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
	scene.add( floor );

	// Key SpotLight with Shadows (placed front/left to cast shadow to back/right)
	const spotLight = new THREE.SpotLight( 0xffffff, 250, 30, Math.PI / 4, 0.5, 2.0 );
	spotLight.position.set( - 4, 6, 4 );
	spotLight.target.position.set( 0, 1, 0 );
	spotLight.castShadow = true;
	spotLight.shadow.mapSize.width = 2048;
	spotLight.shadow.mapSize.height = 2048;
	spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 10;
	spotLight.shadow.bias = - 0.001;
	scene.add( spotLight );
	scene.add( spotLight.target );

	// Neutral White Rim/Fill Light (placed back/right)
	const rimLight = new THREE.DirectionalLight( 0xffffff, 1.2 );
	rimLight.position.set( 4, 6, - 4 );
	scene.add( rimLight );

	// Soft Ambient Light to fill deep shadows
	const ambientLight = new THREE.AmbientLight( 0xffffff, 0.15 );
	scene.add( ambientLight );

	// Load environment map and model
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

	prefab = ( await new GLTFLoader().loadAsync( '../examples/models/gltf/ShaderBall.glb' ) ).scene;
	prefab.traverse( ( child ) => {

		if ( child.isMesh ) {

			child.castShadow = true;
			child.receiveShadow = true;

		}

	} );
	scene.add( prefab );

	calibrationMesh = prefab.getObjectByName( 'Calibration_Mesh' );

	previewMesh = prefab.getObjectByName( 'Preview_Mesh' );

	// Convert sphere geometry to non-indexed so the faces can separate
	previewMesh.geometry.computeTangents();
	previewMesh.geometry = previewMesh.geometry.toNonIndexed();

	model = previewMesh;

	resetScene();

}

function update() {

	// TODO: Probably a cache-key issue, see #normal and goto playground
	model.material.needsUpdate = true;

	controls.update();
	renderPipeline.render();

}

function resize( width, height ) {

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

}

function dispose() {

	// TODO: Implement dispose

}

function debug() {

	return { scene, camera, object: previewMesh || model };

}

export { scene, camera, controls, defaultPass, renderPipeline, model, floor, dragging, debug };
