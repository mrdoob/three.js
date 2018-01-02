function testInit() {

	var AMOUNT = 6;
	var SIZE = 1 / AMOUNT;
	var ASPECT_RATIO = testHelperGetCameraAspect();

	var cameras = [];

	for ( var y = 0; y < AMOUNT; y ++ ) {

		for ( var x = 0; x < AMOUNT; x ++ ) {

			var subcamera = new THREE.PerspectiveCamera( 40, ASPECT_RATIO, 0.1, 10 );
			subcamera.bounds = new THREE.Vector4( x / AMOUNT, y / AMOUNT, SIZE, SIZE );
			subcamera.position.x = ( x / AMOUNT ) - 0.5;
			subcamera.position.y = 0.5 - ( y / AMOUNT );
			subcamera.position.z = 1.5;
			subcamera.position.multiplyScalar( 2 );
			subcamera.lookAt( new THREE.Vector3() );
			subcamera.updateMatrixWorld();
			cameras.push( subcamera );

		}

	}

	camera = new THREE.ArrayCamera( cameras );
	camera.position.z = 3;

	testHelperSetSizeAndRatio( renderer );
	mesh.rotation.x = 0;
	mesh.rotation.z = 0;

}

function testRenderFrame( frame, count ) {

	mesh.rotation.x += Math.PI / count;
	mesh.rotation.z += 2 * Math.PI / count;

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
