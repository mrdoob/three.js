<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - materials - UltraHDR texture loader</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - UltraHDR texture loader <br/>
			Converted from hdr with <a href="https://gainmap-creator.mono-grid.com/" target="_blank" rel="noopener">converter</a>. <br />
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { UltraHDRLoader } from 'three/addons/loaders/UltraHDRLoader.js';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

			const params = {
				autoRotate: true,
				metalness: 1.0,
				roughness: 0.0,
				exposure: 1.0,
				resolution: '2k',
				type: 'HalfFloatType'
			};

			let renderer, scene, camera, controls, torusMesh, loader;

			init();

			function init() {

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				renderer.toneMappingExposure = params.exposure;

				renderer.setAnimationLoop( render );

				scene = new THREE.Scene();

				torusMesh = new THREE.Mesh(
					new THREE.TorusKnotGeometry( 1, 0.4, 128, 128, 1, 3 ),
					new THREE.MeshStandardMaterial( { roughness: params.roughness, metalness: params.metalness } )
				 );
				scene.add( torusMesh );

				camera = new THREE.PerspectiveCamera(
					50,
					window.innerWidth / window.innerHeight,
					1,
					500
				);
				camera.position.set( 0.0, 0.0, - 6.0 );

				controls = new OrbitControls( camera, renderer.domElement );
			
				loader = new UltraHDRLoader();
				loader.setDataType( THREE.FloatType );

				const loadEnvironment = function ( resolution = '2k', type = 'HalfFloatType' ) {

					loader.setDataType( THREE[ type ] );

					loader.load( `textures/equirectangular/spruit_sunrise_${resolution}.hdr.jpg`, function ( texture ) {

						texture.mapping = THREE.EquirectangularReflectionMapping;
						texture.needsUpdate = true;

						scene.background = texture;
						scene.environment = texture;

					} );

				};

				loadEnvironment( params.resolution, params.type );

				const gui = new GUI();

				gui.add( params, 'autoRotate' );
				gui.add( params, 'metalness', 0, 1, 0.01 );
				gui.add( params, 'roughness', 0, 1, 0.01 );
				gui.add( params, 'exposure', 0, 4, 0.01 );
				gui.add( params, 'resolution', [ '2k', '4k' ] ).onChange( ( value ) => {

					loadEnvironment( value, params.type );
			
				} );
				gui.add( params, 'type', [ 'HalfFloatType', 'FloatType' ] ).onChange( ( value ) => {

					loadEnvironment( params.resolution, value );
			
				} );

				gui.open();

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;

				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function render() {

				torusMesh.material.roughness = params.roughness;
				torusMesh.material.metalness = params.metalness;

				if ( params.autoRotate ) {

					torusMesh.rotation.y += 0.005;

				}

				renderer.toneMappingExposure = params.exposure;

				controls.update();

				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>
