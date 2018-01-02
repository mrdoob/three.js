function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	testHelperResetMixer( mixer );

	// Force a nonsense rendering, as the first one is always invalid on Safari, Chrome and Edge.
	// Firefox has no such issue.
	renderer.render( scene, camera );

}

function testRenderFrame( frame, count ) {

	mixer.update( 1.0 / count );
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
