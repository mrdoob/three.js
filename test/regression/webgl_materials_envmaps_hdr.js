function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0.0, 40, 40 * 3.5 );
	testHelperSetSizeAndRatio( renderer );
	for ( var i = 0, l = objects.length; i < l; i ++ ) {

		var object = objects[ i ];
		object.rotation.y = 0.0;

	}

}

function testRenderFrame( frame, count ) {

	_saved_render();
	testHelperFrameReady( renderer );

}

testHelperRun();
