function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	var elapsedTime = 4 * Math.PI * frame / count;

	camera.position.x = Math.cos( elapsedTime * 0.5 ) * 10;
	camera.position.y = 4;
	camera.position.z = Math.sin( elapsedTime * 0.5 ) * 10;

	camera.lookAt( scene.position );

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
