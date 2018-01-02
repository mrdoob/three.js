function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 3, 0.15, 3 );
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	var timer = 2 * Math.PI * frame / count;

	camera.position.x = Math.cos( timer ) * 3;
	camera.position.z = Math.sin( timer ) * 3;

	camera.lookAt( cameraTarget );

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
