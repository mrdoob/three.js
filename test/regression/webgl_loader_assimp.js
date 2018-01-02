function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 600, 1150, 5 );
	camera.up.set( 0, 0, 1 );
	camera.lookAt( new THREE.Vector3( - 100, 0, 0 ) );
	testHelperSetSizeAndRatio( renderer );

	// The first render is flaky on Chrome.
	renderer.render( scene, camera );

}

function testRenderFrame( frame, count ) {

	if ( animation ) animation.setTime( frame );
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
