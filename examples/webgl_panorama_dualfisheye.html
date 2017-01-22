<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - dual fisheye panorama</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<style>
			body {
				background-color: #000000;
				margin: 0px;
				overflow: hidden;
			}

			#info {
				position: absolute;
				top: 0px; width: 100%;
				color: #000000;
				padding: 5px;
				font-family:Monospace;
				font-size:13px;
				font-weight: bold;
				text-align:center;
			}

			a {
				color: #0000ff;
			}
		</style>
	</head>
	<body>

		<div id="container"></div>
		<div id="info">
			<a href="http://threejs.org" target="_blank">three.js webgl</a> - dualfisheye panorama.
		</div>

		<script src="../build/three.js"></script>

		<script>

			var camera, scene, renderer;

			var isUserInteracting = false,
			onMouseDownMouseX = 0, onMouseDownMouseY = 0,
			lon = 0, onMouseDownLon = 0,
			lat = 0, onMouseDownLat = 0,
			phi = 0, theta = 0,
			distance = 500;

			init();
			animate();

			function init() {

				var container, mesh;

				container = document.getElementById( 'container' );

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );

				scene = new THREE.Scene();

				var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 ).toNonIndexed();
				geometry.scale( - 1, 1, 1 );

				// Remap UVs

				var normals = geometry.attributes.normal.array;
				var uvs = geometry.attributes.uv.array;

				for ( var i = 0, l = normals.length / 3; i < l; i ++ ) {

					var x = normals[ i * 3 + 0 ];
					var y = normals[ i * 3 + 1 ];
					var z = normals[ i * 3 + 2 ];

					if ( i < l / 2 ) {

						var correction = ( x == 0 && z == 0 ) ? 1 : ( Math.acos( y ) / Math.sqrt( x * x + z * z ) ) * ( 2 / Math.PI );
						uvs[ i * 2 + 0 ] = x * ( 404 / 1920 ) * correction + ( 447 / 1920 );
						uvs[ i * 2 + 1 ] = z * ( 404 / 1080 ) * correction + ( 582 / 1080 );

					} else {

						var correction = ( x == 0 && z == 0 ) ? 1 : ( Math.acos( - y ) / Math.sqrt( x * x + z * z ) ) * ( 2 / Math.PI );
						uvs[ i * 2 + 0 ] = - x * ( 404 / 1920 ) * correction + ( 1460 / 1920 );
						uvs[ i * 2 + 1 ] = z * ( 404 / 1080 ) * correction + ( 582 / 1080 );

					}

				}

				geometry.rotateZ( - Math.PI / 2 );

				//

				var texture = new THREE.TextureLoader().load( 'textures/ricoh_theta_s.jpg' );
				texture.format = THREE.RGBFormat;

				var material   = new THREE.MeshBasicMaterial( { map: texture } );

				mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				document.addEventListener( 'wheel', onDocumentMouseWheel, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseDown( event ) {

				event.preventDefault();

				isUserInteracting = true;

				onPointerDownPointerX = event.clientX;
				onPointerDownPointerY = event.clientY;

				onPointerDownLon = lon;
				onPointerDownLat = lat;

			}

			function onDocumentMouseMove( event ) {

				if ( isUserInteracting === true ) {

					lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
					lat = ( onPointerDownPointerY - event.clientY ) * 0.1 + onPointerDownLat;

				}

			}

			function onDocumentMouseUp( event ) {

				isUserInteracting = false;

			}

			function onDocumentMouseWheel( event ) {

				distance += event.deltaY * 0.05;

			}

			function animate() {

				requestAnimationFrame( animate );
				update();

			}

			function update() {

				if ( isUserInteracting === false ) {

					lon += 0.1;

				}

				lat = Math.max( - 85, Math.min( 85, lat ) );
				phi = THREE.Math.degToRad( 90 - lat );
				theta = THREE.Math.degToRad( lon - 180 );

				camera.position.x = distance * Math.sin( phi ) * Math.cos( theta );
				camera.position.y = distance * Math.cos( phi );
				camera.position.z = distance * Math.sin( phi ) * Math.sin( theta );

				camera.lookAt( scene.position );

				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>
