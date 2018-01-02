function testInit() {

	camera = new THREE.PerspectiveCamera( 30, testHelperGetCameraAspect(), 1, 10000 );
	camera.position.z = 2200;
	testHelperSetSizeAndRatio( renderer );
	mixer.resetAllAction();

	// Force a nonsense rendering, as the first one is always invalid on Safari, Chrome and Edge.
	// Firefox has no such issue.
	renderer.render( scene, camera );

}

function testRenderFrame( frame, count ) {

	mouseX = mouseY = 0;
	camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y = THREE.Math.clamp( camera.position.y + ( - mouseY - camera.position.y ) * .05, 0, 1000 );

	camera.lookAt( scene.position );
	mixer.update( 1.0 / count );
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
