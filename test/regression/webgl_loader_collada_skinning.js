function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 15, 10, - 15 );
	testHelperSetSizeAndRatio( renderer );
	testHelperResetMixer( mixer );
	mixer.update( 0 );

	renderer.render( scene, camera );

}

function testRenderFrame( frame, count ) {

	mixer.update( 2.0 / count );
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
