function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	camera.position.set( 0.0, 400, 400 * 3.5 );

}

function testRenderFrame( frame, count ) {

	var timer = 2 * Math.PI * frame / count;

	camera.lookAt( scene.position );

	particleLight.position.x = Math.sin( timer * 7 ) * 300;
	particleLight.position.y = Math.cos( timer * 5 ) * 400;
	particleLight.position.z = Math.cos( timer * 3 ) * 300;

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
