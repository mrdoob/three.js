function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	var time = frame;


	object.position.y = 1;
	object.rotation.x = time * 0.5;
	object.rotation.y = time * 0.2;

	object.updateMatrix();
	transform.copy( object.matrix );

	var bouncy = Math.cos( time * .5 ) * 0.5 + 0.7;
	transform.multiply(
		tmpMatrix.makeScale( bouncy, bouncy, bouncy ) );

	assignTransformedPlanes(
		clipMaterial.clippingPlanes, Planes, transform );

	var planeMeshes = volumeVisualization.children;

	for ( var i = 0, n = planeMeshes.length; i !== n; ++ i ) {

		tmpMatrix.multiplyMatrices( transform, PlaneMatrices[ i ] );
		setObjectWorldMatrix( planeMeshes[ i ], tmpMatrix );

	}

	transform.makeRotationY( time * 0.1 );

	assignTransformedPlanes(
		globalClippingPlanes, GlobalClippingPlanes, transform );



	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
