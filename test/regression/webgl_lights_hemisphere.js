function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 0, 250 );
	testHelperSetSizeAndRatio( renderer );
	for ( var i = 0; i < mixers.length; i ++ ) {

		testHelperResetMixer( mixers[ i ] );

	}

}

function testRenderFrame( frame, count ) {


	for ( var i = 0; i < mixers.length; i ++ ) {

		mixers[ i ].update( 1 / count );

	}

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
