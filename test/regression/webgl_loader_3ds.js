function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	camera.position.set( 0, 0, 2 );
	controls.reset();
	controls.update();

}

function testRenderFrame( frame, count ) {

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
