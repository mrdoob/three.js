function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 200, 400 );
	testHelperSetSizeAndRatio( renderer );
	mixer.resetAllAction();
	mixer.update( 0 );

	renderer.render( scene, camera );

}

function testRenderFrame( frame, count ) {

	mixer.update( 4.0 / count );
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();

