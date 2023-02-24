import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import * as CameraUtils from 'three/addons/utils/CameraUtils.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';

let camera, scene, renderer, stats;
let cube, display, material;

let eyeCamera, eyeRenderTarget, eyeCameraHelper, params = { frameCorners: false};

let controls;

init();

function init() {

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animation );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResized );

	stats = new Stats();
	document.body.appendChild( stats.dom );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.x = 60;
    camera.position.y = 20;
    camera.position.z = 30;
    scene.add( camera );

	new RGBELoader()
		.setPath( 'textures/equirectangular/' )
		.load( 'quarry_01_1k.hdr', function ( texture ) {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			scene.background = texture;
			scene.environment = texture;
		} );

	//

	eyeRenderTarget = new THREE.WebGLRenderTarget( 256, 256 );
    eyeRenderTarget.texture.type = THREE.HalfFloatType;
    eyeRenderTarget.texture.encoding = renderer.outputEncoding;

	eyeCamera = new THREE.PerspectiveCamera( 30, 16.0/9.0, 1, 100 );
	eyeCamera.position.x = 0.0;
	eyeCamera.position.y = 0.0;
    eyeCamera.position.z = 30;
    scene.add( eyeCamera );
	eyeCameraHelper = new THREE.CameraHelper( eyeCamera );
	scene.add( eyeCameraHelper );

	//

	material = new THREE.MeshBasicMaterial( {
		map: eyeRenderTarget.texture,
		//roughness: 0.05,
		//metalness: 1
	} );

	const gui = new GUI();
	gui.add( eyeCamera, 'fov', 0, 179 );
	gui.add( params, 'frameCorners', false );
	gui.add( renderer, 'toneMappingExposure', 0, 2 ).name( 'exposure' );

    let displayGeometry = new THREE.PlaneGeometry(50, 20, 16, 16);
    let vertices = displayGeometry.getAttribute("position").array;
    let tempVec = new THREE.Vector3(); let circleCenterZ = 20;
    let radius = tempVec.set(-25, 0, circleCenterZ).length();
    for (let i = 0; i < vertices.length; i += 3){
        tempVec.set(vertices[i], 0, -circleCenterZ).setLength(radius);
        vertices[i    ] = tempVec.x;
        vertices[i + 2] = tempVec.z + circleCenterZ;
    }
	display = new THREE.Mesh( displayGeometry, material );
    
	scene.add( display );

	const material2 = new THREE.MeshStandardMaterial( {
		roughness: 0.1,
		metalness: 0
	} );

	cube = new THREE.Mesh( new THREE.BoxGeometry( 15, 15, 15 ), material2 );
	cube.position.x = 0.0;
	cube.position.y = 0.0;
	cube.position.z = -30;
	scene.add( cube );

	//

	controls = new OrbitControls( camera, renderer.domElement );
	//controls.autoRotate = true;

}

function onWindowResized() {

	renderer.setSize( window.innerWidth, window.innerHeight );

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

}

function animation( msTime ) {

	const time = msTime / 1000;

	eyeCamera.position.x = Math.cos( time * 0.5 ) * 30;
	//eyeCamera.position.y = Math.sin( time ) * 30;
	eyeCamera.position.z = 30 + Math.sin( time ) * 20;
	eyeCamera.lookAt( cube.position );

	// save the original camera properties
	const currentRenderTarget = renderer.getRenderTarget();
	const currentXrEnabled = renderer.xr.enabled;
	const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
	renderer.xr.enabled = false; // Avoid camera modification
	renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

	// render the eye's perspective
    if (params.frameCorners) {
        CameraUtils.frameCorners(eyeCamera,
            new THREE.Vector3(-25, -10, 0),
            new THREE.Vector3( 25, -10, 0),
            new THREE.Vector3(-25,  10, 0), false);
    } else {
        eyeCamera.updateProjectionMatrix();
    }
	renderer.setRenderTarget( eyeRenderTarget );
	renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897
	if ( renderer.autoClear === false ) renderer.clear();
	display.visible = false; // hide the display from from the eye's camera
	eyeCameraHelper.visible = false;
	renderer.render( scene, eyeCamera );
	display.visible = true; // re-enable this display's visibility for debug rendering
	eyeCameraHelper.visible = true;

	// restore the original rendering properties
	renderer.xr.enabled = currentXrEnabled;
	renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
	renderer.setRenderTarget( currentRenderTarget );

	eyeCameraHelper.update();

	controls.update();

	renderer.render( scene, camera );

	stats.update();

}
