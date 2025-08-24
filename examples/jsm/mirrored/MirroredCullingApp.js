/* eslint-disable */
import { OrbitControls } from '../controls/OrbitControls.js';
import { GLTFLoader } from '../loaders/GLTFLoader.js';
import { GUI } from '../libs/lil-gui.module.min.js';

export async function initMirroredCullingApp( THREE, renderer, options = {} ) {

	// GUI-only; no legacy DOM UI elements

	// UI state for projection/view/scene flips
	const params = {
		projection: { x: true, y: false, z: false }, // default mirror X
		view: { x: false, y: false, z: false },
		scene: { x: false, y: false, z: false }
	};

	// renderer
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// scene
	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x333333 );

	// cameras
	const mainCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / 2 / window.innerHeight, 0.1, 100 );
	mainCamera.name = 'mainCamera';
	mainCamera.position.z = 8;

	const mirroredCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / 2 / window.innerHeight, 0.1, 100 );
	mirroredCamera.name = 'mirroredCamera';
	mirroredCamera.position.z = 8;

	// lights
	scene.add( new THREE.AmbientLight( 0xffffff, 1.5 ) );
	const dirLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
	dirLight.position.set( 5, 5, 5 );
	scene.add( dirLight );

	const hemi = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.8 );
	hemi.position.set( 0, 10, 0 );
	scene.add( hemi );

	const fill = new THREE.DirectionalLight( 0xffffff, 1.5 );
	fill.position.set( - 5, 3, - 5 );
	scene.add( fill );

	const point = new THREE.PointLight( 0xffffff, 1.2, 50 );
	point.position.set( 0, 5, 5 );
	scene.add( point );

	// loaders
	const gltfLoader = new GLTFLoader();

	async function createPrimitivesGroup( color ) {

		const group = new THREE.Group();
		const material = new THREE.MeshStandardMaterial( { color } );

		const helmetPath = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
		const gltf = await gltfLoader.loadAsync( helmetPath );
		const helmet = gltf.scene;
		helmet.scale.set( 1.5, 1.5, 1.5 );
		group.add( helmet );

		const coneGeo = new THREE.ConeGeometry( 1, 2, 32 );
		const cone = new THREE.Mesh( coneGeo, material );
		cone.position.set( 3, 1, 0 );
		group.add( cone );

		const torusGeo = new THREE.TorusGeometry( 1, 0.4, 16, 100 );
		const torus = new THREE.Mesh( torusGeo, material );
		torus.position.set( - 3, 1, 0 );
		torus.rotation.x = Math.PI / 2;
		group.add( torus );

		const normalMaterial = new THREE.MeshNormalMaterial();
		const cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), normalMaterial );
		cube.position.set( 0, 0, 5 );
		group.add( cube );

		return group;

	}

	// controls
	let mainControls = new OrbitControls( mainCamera, renderer.domElement );
	let mirroredControls = new OrbitControls( mirroredCamera, renderer.domElement );

	// mouse split control
	let mouseX = 0;
	window.addEventListener( 'mousemove', ( event ) => { mouseX = event.clientX; } );

	// helpers applying state
	function applyProjectionState( cam ) {

		cam.updateProjectionMatrix();
		const sx = params.projection.x ? - 1 : 1;
		const sy = params.projection.y ? - 1 : 1;
		const sz = params.projection.z ? - 1 : 1;
		cam.projectionMatrix.scale( new THREE.Vector3( sx, sy, sz ) );

	}

	function applyViewState( cam ) {

		const s = cam.scale;
		s.x = ( params.view.x ? - 1 : 1 ) * Math.abs( s.x );
		s.y = ( params.view.y ? - 1 : 1 ) * Math.abs( s.y );
		s.z = ( params.view.z ? - 1 : 1 ) * Math.abs( s.z );
		cam.updateMatrixWorld();

	}

	function applySceneState() {

		const s = scene.scale;
		s.x = ( params.scene.x ? - 1 : 1 ) * Math.abs( s.x );
		s.y = ( params.scene.y ? - 1 : 1 ) * Math.abs( s.y );
		s.z = ( params.scene.z ? - 1 : 1 ) * Math.abs( s.z );
		scene.updateMatrixWorld( true );

	}

	// actions
	let _syncing = false;
	function syncFrom( source ) {

		if ( _syncing ) return;
		_syncing = true;

		if ( source === 'main' ) {

			mirroredCamera.position.copy( mainCamera.position );
			mirroredCamera.quaternion.copy( mainCamera.quaternion );
			mirroredCamera.zoom = mainCamera.zoom;
			mirroredCamera.updateMatrixWorld();
			mirroredCamera.updateProjectionMatrix();
			mirroredControls.target.copy( mainControls.target );
			// Ensure mirrored camera applies flip state after sync
			applyViewState( mirroredCamera );
			applyProjectionState( mirroredCamera );
			mirroredControls.update();

		} else {

			mainCamera.position.copy( mirroredCamera.position );
			mainCamera.quaternion.copy( mirroredCamera.quaternion );
			mainCamera.zoom = mirroredCamera.zoom;
			mainCamera.updateMatrixWorld();
			mainCamera.updateProjectionMatrix();
			mainControls.target.copy( mirroredControls.target );
			mainControls.update();

		}

		_syncing = false;

	}

	function syncCameras() { syncFrom( 'main' ); }

	function resetMirrored() {

		mirroredCamera.scale.set( 1, 1, 1 );
		mirroredCamera.updateMatrixWorld();
		mirroredCamera.updateProjectionMatrix();
		applyProjectionState( mirroredCamera );

	}

	function flipProjectionAxis( axis ) {

		// toggle state then apply
		if ( axis === 'x' ) params.projection.x = ! params.projection.x;
		if ( axis === 'y' ) params.projection.y = ! params.projection.y;
		if ( axis === 'z' ) params.projection.z = ! params.projection.z;
		applyProjectionState( mirroredCamera );

	}

	function flipViewAxis( axis ) {

		if ( axis === 'x' ) params.view.x = ! params.view.x;
		if ( axis === 'y' ) params.view.y = ! params.view.y;
		if ( axis === 'z' ) params.view.z = ! params.view.z;
		applyViewState( mirroredCamera );

	}

	// auto-sync on OrbitControls changes (GUI-only flow: always on)
	mainControls.addEventListener( 'change', () => { syncFrom( 'main' ); } );
	mirroredControls.addEventListener( 'change', () => { syncFrom( 'mirrored' ); } );

	// GUI (reuse injected GUI if provided)
	const uiContainer = document.getElementById( 'ui' );
	const gui = options.gui || new GUI( { title: 'Mirrored Camera Culling' } );
	if ( ! options.gui && uiContainer ) uiContainer.appendChild( gui.domElement );
	const projFolder = gui.addFolder( 'Projection Flip' );
	projFolder.add( params.projection, 'x' ).name( 'X' ).onChange( () => applyProjectionState( mirroredCamera ) );
	projFolder.add( params.projection, 'y' ).name( 'Y' ).onChange( () => applyProjectionState( mirroredCamera ) );
	projFolder.add( params.projection, 'z' ).name( 'Z' ).onChange( () => applyProjectionState( mirroredCamera ) );

	const viewFolder = gui.addFolder( 'View Scale Flip' );
	viewFolder.add( params.view, 'x' ).name( 'X' ).onChange( () => applyViewState( mirroredCamera ) );
	viewFolder.add( params.view, 'y' ).name( 'Y' ).onChange( () => applyViewState( mirroredCamera ) );
	viewFolder.add( params.view, 'z' ).name( 'Z' ).onChange( () => applyViewState( mirroredCamera ) );
    const sceneFolder = gui.addFolder( 'Scene Flip' );
    sceneFolder.add( params.scene, 'x' ).name( 'X' ).onChange( applySceneState );
    sceneFolder.add( params.scene, 'y' ).name( 'Y' ).onChange( applySceneState );
    sceneFolder.add( params.scene, 'z' ).name( 'Z' ).onChange( applySceneState );

	// Debug info under GUI
	const debugState = {
		main: { mwDet: '', pmDet: '', scale: '', worldScale: '', projDiag: '' },
		mirrored: { mwDet: '', pmDet: '', scale: '', worldScale: '', projDiag: '' },
		scene: { mwDet: '', scale: '' }
	};
	const debugFolder = gui.addFolder( 'Debug' );
	const mainCamFolder = debugFolder.addFolder( 'Main Camera' );
	mainCamFolder.add( debugState.main, 'mwDet' ).name( 'matrixWorld.det' ).listen();
	mainCamFolder.add( debugState.main, 'pmDet' ).name( 'projection.det' ).listen();
	mainCamFolder.add( debugState.main, 'scale' ).name( 'scale' ).listen();
	mainCamFolder.add( debugState.main, 'worldScale' ).name( 'world scale' ).listen();
	mainCamFolder.add( debugState.main, 'projDiag' ).name( 'proj diag [m00,m11,m22]' ).listen();

	const mirroredCamFolder = debugFolder.addFolder( 'Mirrored Camera' );
	mirroredCamFolder.add( debugState.mirrored, 'mwDet' ).name( 'matrixWorld.det' ).listen();
	mirroredCamFolder.add( debugState.mirrored, 'pmDet' ).name( 'projection.det' ).listen();
	mirroredCamFolder.add( debugState.mirrored, 'scale' ).name( 'scale' ).listen();
	mirroredCamFolder.add( debugState.mirrored, 'worldScale' ).name( 'world scale' ).listen();
	mirroredCamFolder.add( debugState.mirrored, 'projDiag' ).name( 'proj diag [m00,m11,m22]' ).listen();

	const sceneInfoFolder = debugFolder.addFolder( 'Scene' );
	sceneInfoFolder.add( debugState.scene, 'mwDet' ).name( 'matrixWorld.det' ).listen();
	sceneInfoFolder.add( debugState.scene, 'scale' ).name( 'scale' ).listen();

	projFolder.open();
	viewFolder.open();

	// scene content
	let testGroup;
	async function setupScene() {

		testGroup = await createPrimitivesGroup( 0x00ff00 );
		testGroup.position.x = 0;
		scene.add( testGroup );

	}

	function formatVec3( v ) {
		return `(${v.x.toFixed( 3 )}, ${v.y.toFixed( 3 )}, ${v.z.toFixed( 3 )})`;
	}

	const _pos = new THREE.Vector3();
	const _rot = new THREE.Quaternion();
	const _scl = new THREE.Vector3();

	function getWorldScale( obj ) {

		obj.matrixWorld.decompose( _pos, _rot, _scl );
		return _scl.clone();

	}

	function projDiag( cam ) {

		const e = cam.projectionMatrix.elements;
		return new THREE.Vector3( e[ 0 ], e[ 5 ], e[ 10 ] );

	}

	function updateDebug() {

		const cams = [ mainCamera, mirroredCamera ];
		let out = '';
		for ( const cam of cams ) {
			const mDet = cam.matrixWorld.determinant();
			const pDet = cam.projectionMatrix.determinant();
			const worldScale = getWorldScale( cam );
			const diag = projDiag( cam );
			const target = cam === mainCamera ? debugState.main : debugState.mirrored;
			target.mwDet = mDet.toFixed( 6 );
			target.pmDet = pDet.toFixed( 6 );
			target.scale = formatVec3( cam.scale );
			target.worldScale = formatVec3( worldScale );
			target.projDiag = formatVec3( diag );
			out += `${cam.name}\n`;
			out += `  matrixWorld.determinant: ${mDet.toFixed( 6 )}\n`;
			out += `  projectionMatrix.determinant: ${pDet.toFixed( 6 )}\n`;
			out += `  camera.scale: ${formatVec3( cam.scale )}\n`;
			out += `  world scale (from matrixWorld): ${formatVec3( worldScale )}\n`;
			out += `  projection diag [m00,m11,m22]: ${formatVec3( diag )}\n\n`;
		}

		// scene info
		scene.updateMatrixWorld( true );
		const sceneDet = scene.matrixWorld.determinant();
		debugState.scene.mwDet = sceneDet.toFixed( 6 );
		debugState.scene.scale = formatVec3( scene.scale );
		out += `scene\n`;
		out += `  matrixWorld.determinant: ${sceneDet.toFixed( 6 )}\n`;
		out += `  scene.scale: ${formatVec3( scene.scale )}\n\n`;

	}

	await setupScene();
	// apply initial state (mirror X on projection)
	applyProjectionState( mirroredCamera );
    applySceneState();

	function animate() {

		requestAnimationFrame( animate );

		const w = window.innerWidth;
		const h = window.innerHeight;
		const halfW = w / 2;

		// enable one set of controls based on mouse position
		if ( mouseX < halfW ) {
			mainControls.enabled = true; mirroredControls.enabled = false;
		} else {
			mainControls.enabled = false; mirroredControls.enabled = true;
		}

		mainControls.update();
		mirroredControls.update();

		renderer.setScissorTest( true );
		renderer.setScissor( 0, 0, halfW, h );
		renderer.setViewport( 0, 0, halfW, h );
		renderer.render( scene, mainCamera );
		renderer.setScissor( halfW, 0, halfW, h );
		renderer.setViewport( halfW, 0, halfW, h );
		renderer.render( scene, mirroredCamera );
		renderer.setScissorTest( false );

		updateDebug();

	}

	animate();

	window.addEventListener( 'resize', () => {

		renderer.setSize( window.innerWidth, window.outerHeight || window.innerHeight );
		mainCamera.aspect = ( window.innerWidth / 2 ) / window.innerHeight;
		mainCamera.updateProjectionMatrix();
		mirroredCamera.aspect = ( window.innerWidth / 2 ) / window.innerHeight;
		mirroredCamera.updateProjectionMatrix();
		// Reapply projection flip state after aspect change
		applyProjectionState( mirroredCamera );

	} );

	return { scene, mainCamera, mirroredCamera, renderer };

}


