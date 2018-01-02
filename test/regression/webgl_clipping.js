function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	var time = frame;

	object.position.y = 0.8;
	object.rotation.x = time * 0.5;
	object.rotation.y = time * 0.2;
	object.scale.setScalar( Math.cos( time ) * 0.125 + 0.875 );

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
