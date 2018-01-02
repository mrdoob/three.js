function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	testHelperResetMixer( mixer );

}

function testRenderFrame( frame, count ) {

	mixer.update( 1.0 * 4 / count );
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
