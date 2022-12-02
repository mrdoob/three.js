<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - dashed lines</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>

	<body>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - dashed lines example</div>
		<div id="container"></div>

		<!-- Import maps polyfill -->
		<!-- Remove this when import maps will be widely supported -->
		<script async src="https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"></script>

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

			import Stats from 'three/addons/libs/stats.module.js';

			import * as GeometryUtils from 'three/addons/utils/GeometryUtils.js';

			let renderer, scene, camera, stats;
			const objects = [];

			const WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

			init();
			animate();

			function init() {

				camera = new THREE.PerspectiveCamera( 60, WIDTH / HEIGHT, 1, 200 );
				camera.position.z = 150;

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x111111 );
				scene.fog = new THREE.Fog( 0x111111, 150, 200 );

				const subdivisions = 6;
				const recursion = 1;

				const points = GeometryUtils.hilbert3D( new THREE.Vector3( 0, 0, 0 ), 25.0, recursion, 0, 1, 2, 3, 4, 5, 6, 7 );
				const spline = new THREE.CatmullRomCurve3( points );

				const samples = spline.getPoints( points.length * subdivisions );
				const geometrySpline = new THREE.BufferGeometry().setFromPoints( samples );

				const line = new THREE.Line( geometrySpline, new THREE.LineDashedMaterial( { color: 0xffffff, dashSize: 1, gapSize: 0.5 } ) );
				line.computeLineDistances();

				objects.push( line );
				scene.add( line );

				const geometryBox = box( 50, 50, 50 );

				const lineSegments = new THREE.LineSegments( geometryBox, new THREE.LineDashedMaterial( { color: 0xffaa00, dashSize: 3, gapSize: 1 } ) );
				lineSegments.computeLineDistances();

				objects.push( lineSegments );
				scene.add( lineSegments );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( WIDTH, HEIGHT );

				const container = document.getElementById( 'container' );
				container.appendChild( renderer.domElement );

				stats = new Stats();
				container.appendChild( stats.dom );

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			function box( width, height, depth ) {

				width = width * 0.5,
				height = height * 0.5,
				depth = depth * 0.5;

				const geometry = new THREE.BufferGeometry();
				const position = [];

				position.push(
					- width, - height, - depth,
					- width, height, - depth,

					- width, height, - depth,
					width, height, - depth,

					width, height, - depth,
					width, - height, - depth,

					width, - height, - depth,
					- width, - height, - depth,

					- width, - height, depth,
					- width, height, depth,

					- width, height, depth,
					width, height, depth,

					width, height, depth,
					width, - height, depth,

					width, - height, depth,
					- width, - height, depth,

					- width, - height, - depth,
					- width, - height, depth,

					- width, height, - depth,
					- width, height, depth,

					width, height, - depth,
					width, height, depth,

					width, - height, - depth,
					width, - height, depth
				 );

				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );

				return geometry;

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}

			function render() {

				const time = Date.now() * 0.001;

				scene.traverse( function ( object ) {

					if ( object.isLine ) {

						object.rotation.x = 0.25 * time;
						object.rotation.y = 0.25 * time;

					}

				} );

				renderer.render( scene, camera );

			}

	</script>

</body>

</html>
