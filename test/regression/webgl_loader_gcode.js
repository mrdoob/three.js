function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 0, 50 );
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	var timer = 2 * Math.PI * frame / count;

	camera.position.x = Math.sin( timer ) * 50;
	camera.position.z = Math.cos( timer ) * 50;
	camera.lookAt( scene.position );

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();

