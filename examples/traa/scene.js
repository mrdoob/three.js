import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// Procedural, deterministic challenges shared by the WebGL and WebGPU runners.
export async function createTRAATestScene() {

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 42, 1, 0.1, 60 );
	camera.position.z = 14;
	const ambient = new THREE.HemisphereLight( 0xffffff, 0x334466, 2 );
	scene.add( ambient );
	const light = new THREE.PointLight( 0xffffff, 100 );
	light.position.set( 2, 4, 6 );
	scene.add( light );
	const environment = await new HDRLoader().loadAsync( new URL( '../textures/equirectangular/venice_sunset_1k.hdr', import.meta.url ).href );
	environment.mapping = THREE.EquirectangularReflectionMapping;
	scene.environment = environment;
	scene.backgroundBlurriness = 0.15;

	// A periodic height texture perturbs the surface normals without moving geometry.
	// Its small bright reflections stress shading changes that velocity cannot track.
	const waveData = new Uint8Array( 256 * 256 * 4 );
	for ( let y = 0; y < 256; y ++ ) {

		for ( let x = 0; x < 256; x ++ ) {

			const u = x / 256 * Math.PI * 2;
			const v = y / 256 * Math.PI * 2;
			const height = Math.round( 128 + 48 * Math.sin( u * 24 + Math.sin( v * 4 ) ) + 48 * Math.sin( v * 8 ) );
			waveData.set( [ height, height, height, 255 ], ( y * 256 + x ) * 4 );

		}

	}

	const waves = new THREE.DataTexture( waveData, 256, 256 );
	waves.wrapS = waves.wrapT = THREE.RepeatWrapping;
	waves.minFilter = THREE.LinearMipmapLinearFilter;
	waves.magFilter = THREE.LinearFilter;
	waves.generateMipmaps = true;
	waves.needsUpdate = true;

	const checkerData = new Uint8Array( 64 * 64 * 4 );
	const cutoutData = new Uint8Array( 64 * 64 * 4 );
	for ( let y = 0; y < 64; y ++ ) {

		for ( let x = 0; x < 64; x ++ ) {

			const i = ( y * 64 + x ) * 4;
			const white = ( ( x >> 1 ) + ( y >> 1 ) ) % 2 === 0;
			checkerData.set( [ white ? 255 : 8, white ? 255 : 8, white ? 255 : 8, 255 ], i );
			cutoutData.set( [ 255, 180, 30, white ? 255 : 0 ], i );

		}

	}

	const checker = new THREE.DataTexture( checkerData, 64, 64 );
	const cutout = new THREE.DataTexture( cutoutData, 64, 64 );
	for ( const texture of [ checker, cutout ] ) {

		texture.minFilter = texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;

	}

	const white = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	const patterned = new THREE.MeshBasicMaterial( { map: checker, side: THREE.DoubleSide } );
	const groups = [];
	const labels = [
		'Static: thin edges / fine texture', 'Linear translation', 'Rotation: spokes / texture',
		'Specular highlights / reflections', 'Opposing motion / crossing edges', 'Zoom: approaching fine detail',
		'Concavity: newly exposed surfaces', 'Alpha cutout / blended surface', 'Morphing / instanced motion'
	];
	for ( let i = 0; i < 9; i ++ ) {

		const group = new THREE.Group();
		group.position.set( ( i % 3 - 1 ) * 3.7, ( 1 - Math.floor( i / 3 ) ) * 2.8, 0 );
		scene.add( group );
		groups.push( group );

	}

	function mesh( geometry, material, parent ) {

		const object = new THREE.Mesh( geometry, material );
		parent.add( object );
		return object;

	}

	const staticPlate = mesh( new THREE.PlaneGeometry( 1.5, 1.5 ), patterned, groups[ 0 ] );
	staticPlate.rotation.z = 0.2;
	for ( let i = 0; i < 12; i ++ ) {

		const bar = mesh( new THREE.BoxGeometry( 0.015, 1.8, 0.02 ), white, groups[ 0 ] );
		bar.position.set( ( i - 5.5 ) * 0.17, 0, 0.1 );
		bar.rotation.z = 0.4;

	}

	const linear = mesh( new THREE.PlaneGeometry( 1.25, 1.25 ), patterned, groups[ 1 ] );
	const spinner = new THREE.Group();
	groups[ 2 ].add( spinner );
	mesh( new THREE.CircleGeometry( 0.9, 64 ), patterned, spinner );
	for ( let i = 0; i < 16; i ++ ) {

		const spoke = mesh( new THREE.BoxGeometry( 0.022, 1.85, 0.03 ), white, spinner );
		spoke.rotation.z = i * Math.PI / 16;
		spoke.position.z = 0.1;

	}

	const shiny = mesh( new THREE.TorusKnotGeometry( 0.55, 0.18, 160, 24 ), new THREE.MeshStandardMaterial( { color: 0xddddff, metalness: 1, roughness: 0.04, bumpMap: waves, bumpScale: 0.06 } ), groups[ 3 ] );
	const rear = mesh( new THREE.PlaneGeometry( 1.7, 1.6 ), patterned, groups[ 4 ] );
	const front = new THREE.Group();
	groups[ 4 ].add( front );
	for ( let i = 0; i < 6; i ++ ) {

		const bar = mesh( new THREE.BoxGeometry( 0.13, 1.8, 0.15 ), new THREE.MeshBasicMaterial( { color: i % 2 ? 0xff4422 : 0x22aaff } ), front );
		bar.position.set( ( i - 2.5 ) * 0.27, 0, 0.3 );

	}

	const zoom = mesh( new THREE.PlaneGeometry( 1.5, 1.5 ), patterned, groups[ 5 ] );
	const concave = new THREE.Group();
	groups[ 6 ].add( concave );
	for ( let i = 0; i < 5; i ++ ) {

		const wall = mesh( new THREE.BoxGeometry( 0.12, 1.7, 1.5 ), new THREE.MeshStandardMaterial( { color: new THREE.Color().setHSL( i / 5, 0.8, 0.5 ), roughness: 0.8 } ), concave );
		wall.position.x = ( i - 2 ) * 0.4;

	}

	mesh( new THREE.BoxGeometry( 1.9, 1.7, 0.12 ), new THREE.MeshStandardMaterial( { color: 0xeeeeee } ), concave ).position.z = - 0.75;
	const alphaTest = mesh( new THREE.PlaneGeometry( 1.6, 1.6 ), new THREE.MeshBasicMaterial( { map: cutout, alphaTest: 0.5, side: THREE.DoubleSide } ), groups[ 7 ] );
	const blended = mesh( new THREE.PlaneGeometry( 1, 1.3 ), new THREE.MeshBasicMaterial( { color: 0x44aaff, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide } ), groups[ 7 ] );
	blended.position.z = 0.3;
	const morphGeometry = new THREE.PlaneGeometry( 1.4, 1.4, 20, 20 );
	const morphPosition = morphGeometry.attributes.position.clone();
	for ( let i = 0; i < morphPosition.count; i ++ ) morphPosition.setZ( i, 0.4 * Math.sin( morphPosition.getX( i ) * 9 ) );
	morphGeometry.morphAttributes.position = [ morphPosition ];
	const morph = mesh( morphGeometry, patterned, groups[ 8 ] );
	const instances = new THREE.InstancedMesh( new THREE.BoxGeometry( 0.14, 0.14, 0.14 ), white, 12 );
	groups[ 8 ].add( instances );
	const matrix = new THREE.Matrix4();

	function update( time, { cameraMotion = 'Still', cameraCutOffset = 0, transparentBackground = false } = {} ) {

		scene.background = transparentBackground ? null : environment;
		linear.position.set( 0.65 * Math.sin( time ), 0.18 * Math.cos( time * 0.7 ), 0 );
		spinner.rotation.z = time * 0.6;
		shiny.rotation.set( time * 0.3, time * 0.5, 0 );
		light.position.x = 5 * Math.sin( time * 0.5 );
		rear.position.x = 0.45 * Math.sin( time * 1.3 );
		front.position.x = - 0.55 * Math.sin( time * 1.3 );
		zoom.scale.setScalar( 0.85 + 0.35 * Math.sin( time * 0.7 ) );
		zoom.position.z = 1.2 * Math.sin( time * 0.7 );
		concave.rotation.y = time * 0.45;
		alphaTest.rotation.z = time * 0.25;
		blended.position.x = 0.6 * Math.sin( time * 1.2 );
		morph.morphTargetInfluences[ 0 ] = 0.5 + 0.5 * Math.sin( time );
		for ( let i = 0; i < 12; i ++ ) {

			const angle = i * Math.PI / 6 + time * 0.5;
			matrix.makeTranslation( Math.cos( angle ), Math.sin( angle ), 0.5 );
			instances.setMatrixAt( i, matrix );

		}

		instances.instanceMatrix.needsUpdate = true;
		const distance = Math.max( 14, 10 / camera.aspect );
		camera.position.set( 0, 0, distance );
		if ( cameraMotion === 'Pan' ) camera.position.x = 0.8 * Math.sin( time * 0.6 );
		if ( cameraMotion === 'Orbit' ) camera.position.set( 3 * Math.sin( time * 0.4 ), 0.7 * Math.cos( time * 0.4 ), distance );
		if ( cameraMotion === 'Zoom' ) camera.position.z = distance - 1 + 1.5 * Math.sin( time * 0.5 );
		camera.position.x += cameraCutOffset;
		camera.lookAt( 0, 0, 0 );

	}

	return { scene, camera, labels, update };

}
