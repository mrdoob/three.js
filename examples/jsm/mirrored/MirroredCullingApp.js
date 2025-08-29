/* eslint-disable */
import { OrbitControls } from '../controls/OrbitControls.js';
import { GLTFLoader } from '../loaders/GLTFLoader.js';
import { GUI } from '../libs/lil-gui.module.min.js';

export async function initMirroredCullingApp( THREE, renderer, options = {} ) {

	// GUI-only; no legacy DOM UI elements

	// UI state for projection/view/scene flips
	const params = {
		camera: { type: 'Perspective', fov: 75, orthoSize: 10, near: 0.1, far: 100 },
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
	let mainCamera = new THREE.PerspectiveCamera( params.camera.fov, (window.innerWidth / 2) / window.innerHeight, params.camera.near, params.camera.far );
	mainCamera.name = 'mainCamera';
	mainCamera.position.z = 8;

	let mirroredCamera = new THREE.PerspectiveCamera( params.camera.fov, (window.innerWidth / 2) / window.innerHeight, params.camera.near, params.camera.far );
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

	// controls
	let mainControls = new OrbitControls( mainCamera, renderer.domElement );
	let mirroredControls = new OrbitControls( mirroredCamera, renderer.domElement );

	// mouse split control
	let mouseX = 0;
	window.addEventListener( 'mousemove', ( event ) => { mouseX = event.clientX; } );

	// camera helpers for switching and resizing
	function createCameraByType( type, aspect ) {

		let cam;
		if ( type === 'Orthographic' ) {
			const halfH = params.camera.orthoSize / 2;
			const halfW = halfH * aspect;
			cam = new THREE.OrthographicCamera( - halfW, halfW, halfH, - halfH, params.camera.near, params.camera.far );
		} else {
			cam = new THREE.PerspectiveCamera( params.camera.fov, aspect, params.camera.near, params.camera.far );
		}

		cam.position.z = 8;

		cam.updateProjectionMatrix();
		return cam;

	}

	function updateCameraOnResize( cam ) {

		const aspect = ( window.innerWidth / 2 ) / window.innerHeight;
		if ( cam.isPerspectiveCamera ) {
			cam.aspect = aspect;
		} else if ( cam.isOrthographicCamera ) {
			const halfH = params.camera.orthoSize / 2;
			const halfW = halfH * aspect;
			cam.left = - halfW;
			cam.right = halfW;
			cam.top = halfH;
			cam.bottom = - halfH;
		}
		cam.updateProjectionMatrix();

	}

	function resizeCameras() {

		renderer.setSize( window.innerWidth, window.innerHeight );
		updateCameraOnResize( mainCamera );
		updateCameraOnResize( mirroredCamera );
		// Reapply projection flip state after any projection changes
		applyProjectionState( mirroredCamera );

	}

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

	// auto-sync on OrbitControls changes (GUI-only flow: always on)
	mainControls.addEventListener( 'change', () => { syncFrom( 'main' ); } );
	mirroredControls.addEventListener( 'change', () => { syncFrom( 'mirrored' ); } );

	function rebuildCameras() {

		const aspect = ( window.innerWidth / 2 ) / window.innerHeight;

		// Create new cameras according to selection
		mainCamera = createCameraByType( params.camera.type, aspect );
		mainCamera.name = 'mainCamera';
		mirroredCamera = createCameraByType( params.camera.type, aspect );
		mirroredCamera.name = 'mirroredCamera';

		// Rebuild controls
		if ( mainControls ) mainControls.dispose();
		if ( mirroredControls ) mirroredControls.dispose();
		mainControls = new OrbitControls( mainCamera, renderer.domElement );
		mirroredControls = new OrbitControls( mirroredCamera, renderer.domElement );
		mainControls.addEventListener( 'change', () => { syncFrom( 'main' ); } );
		mirroredControls.addEventListener( 'change', () => { syncFrom( 'mirrored' ); } );

		// Ensure states are re-applied
		applyViewState( mirroredCamera );
		updateCameraOnResize( mainCamera );
		updateCameraOnResize( mirroredCamera );
		applyProjectionState( mirroredCamera );

	}

	function openUpGeometry( geometry ) {

		// Convert to non-indexed for easy triangle removal
		const g = geometry.toNonIndexed();
		const posAttr = g.getAttribute( 'position' );
		const normAttr = g.getAttribute( 'normal' );
		const uvAttr = g.getAttribute( 'uv' );

		const pos = posAttr.array;
		const norm = normAttr ? normAttr.array : null;
		const uv = uvAttr ? uvAttr.array : null;

		const keptPos = [];
		const keptNorm = norm ? [] : null;
		const keptUV = uv ? [] : null;

		const triCount = pos.length / 9;
		for ( let t = 0; t < triCount; t ++ ) {

			const base = t * 9;
			const x0 = pos[ base + 0 ], y0 = pos[ base + 1 ], z0 = pos[ base + 2 ];
			const x1 = pos[ base + 3 ], y1 = pos[ base + 4 ], z1 = pos[ base + 5 ];
			const x2 = pos[ base + 6 ], y2 = pos[ base + 7 ], z2 = pos[ base + 8 ];

			const cx = ( x0 + x1 + x2 ) / 3;
			const cz = ( z0 + z1 + z2 ) / 3;

			// Remove triangles in the +X +Z quadrant to open the mesh
			if ( cx > 0 && cz > 0 ) continue;

			keptPos.push(
				x0, y0, z0,
				x1, y1, z1,
				x2, y2, z2
			);

			if ( keptNorm ) {
				const nb = base;
				keptNorm.push(
					norm[ nb + 0 ], norm[ nb + 1 ], norm[ nb + 2 ],
					norm[ nb + 3 ], norm[ nb + 4 ], norm[ nb + 5 ],
					norm[ nb + 6 ], norm[ nb + 7 ], norm[ nb + 8 ]
				);
			}

			if ( keptUV ) {
				const ub = ( t * 6 );
				keptUV.push(
					uv[ ub + 0 ], uv[ ub + 1 ],
					uv[ ub + 2 ], uv[ ub + 3 ],
					uv[ ub + 4 ], uv[ ub + 5 ]
				);
			}

		}

		const out = new THREE.BufferGeometry();
		out.setAttribute( 'position', new THREE.Float32BufferAttribute( keptPos, 3 ) );
		if ( keptNorm ) out.setAttribute( 'normal', new THREE.Float32BufferAttribute( keptNorm, 3 ) );
		if ( keptUV ) out.setAttribute( 'uv', new THREE.Float32BufferAttribute( keptUV, 2 ) );

		out.computeVertexNormals();
		out.computeBoundingBox();
		out.computeBoundingSphere();

		return out;

	}

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

	const cameraFolder = gui.addFolder( 'Camera' );
	cameraFolder.add( params.camera, 'type', [ 'Perspective', 'Orthographic' ] ).name( 'Type' ).onChange( rebuildCameras );
	cameraFolder.add( params.camera, 'fov', 10, 120, 1 ).name( 'Perspective FOV' ).onChange( () => {
		if ( mainCamera.isPerspectiveCamera ) { mainCamera.fov = params.camera.fov; mainCamera.updateProjectionMatrix(); }
		if ( mirroredCamera.isPerspectiveCamera ) { mirroredCamera.fov = params.camera.fov; mirroredCamera.updateProjectionMatrix(); applyProjectionState( mirroredCamera ); }
	} );
	cameraFolder.add( params.camera, 'orthoSize', 1, 50, 0.1 ).name( 'Ortho Size' ).onChange( () => {
		if ( mainCamera.isOrthographicCamera || mirroredCamera.isOrthographicCamera ) { resizeCameras(); }
	} );

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
	async function setupScene() {

		const step = 4;

		// primitives group (inlined from createPrimitivesGroup)
		const group = new THREE.Group();
		const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );

		const helmetPath = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
		const gltf = await gltfLoader.loadAsync( helmetPath );
		const helmet = gltf.scene;
		helmet.scale.set( 1.5, 1.5, 1.5 );
		helmet.position.set( - step, 0, - step );
		group.add( helmet );

		const coneGeo = new THREE.ConeGeometry( 1, 2, 32 );
		const cone = new THREE.Mesh( coneGeo, material );
		cone.position.set( 0, 1, - step );
		group.add( cone );

		const torusGeo = new THREE.TorusGeometry( 1, 0.4, 16, 100 );
		const torus = new THREE.Mesh( torusGeo, material );
		torus.position.set( step, 1, - step );
		torus.rotation.x = Math.PI / 2;
		group.add( torus );

		const normalMaterial = new THREE.MeshNormalMaterial();
		const cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), normalMaterial );
		cube.position.set( - step, 0, 0 );
		group.add( cube );

		group.position.x = 0;
		scene.add( group );

		// Add open geometry test mesh. Use TSL when running with WebGPU; fallback shader tweak for WebGL.
		let testGeometry = new THREE.SphereGeometry( 2, 32, 32 );
		testGeometry = openUpGeometry( testGeometry );

		let testMaterial;
		if ( renderer.isWebGPURenderer && options.tsl ) {

			const { color, select, frontFacing, float } = options.tsl;
			testMaterial = new THREE.MeshStandardNodeMaterial( { metalness: 0, roughness: 0.45 } );
			testMaterial.side = THREE.DoubleSide;
			testMaterial.transparent = true;
			testMaterial.depthWrite = false;
			testMaterial.colorNode = select( frontFacing, color( 0xff0000 ), color( 0x0000ff ) );
			testMaterial.opacityNode = float( 0.6 );

			const mesh = new THREE.Mesh( testGeometry, testMaterial );
			mesh.position.set( step, 0, 0 );
			scene.add( mesh );

		} else {

			// WebGL fallback: use two meshes, one FrontSide (red), one BackSide (blue), drawn in order
			const frontMat = new THREE.MeshStandardMaterial( { color: 0xff0000, metalness: 0, roughness: 0.45, side: THREE.FrontSide, transparent: true, opacity: 0.6 } );
			frontMat.depthWrite = false;
			const backMat = new THREE.MeshStandardMaterial( { color: 0x0000ff, metalness: 0, roughness: 0.45, side: THREE.BackSide, transparent: true, opacity: 0.6 } );
			backMat.depthWrite = false;

			const backMesh = new THREE.Mesh( testGeometry, backMat );
			const frontMesh = new THREE.Mesh( testGeometry, frontMat );
			backMesh.position.set( step, 0, 0 );
			frontMesh.position.set( step, 0, 0 );
			backMesh.renderOrder = 0;
			frontMesh.renderOrder = 1;
			scene.add( backMesh );
			scene.add( frontMesh );

		}
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
		}

		// scene info
		scene.updateMatrixWorld( true );
		const sceneDet = scene.matrixWorld.determinant();
		debugState.scene.mwDet = sceneDet.toFixed( 6 );
		debugState.scene.scale = formatVec3( scene.scale );

	}

	await setupScene();
	// apply initial state (mirror X on projection)
	applyProjectionState( mirroredCamera );
applySceneState();
	resizeCameras();

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

		resizeCameras();

	} );

	return { scene, mainCamera, mirroredCamera, renderer };

}
