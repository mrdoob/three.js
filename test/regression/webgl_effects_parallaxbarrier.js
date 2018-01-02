function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 0, 0 );
	testHelperSetSizeAndRatio( renderer );
	effect.setSize( TestCanvasWidth, TestCanvasHeight );

}

function testRenderFrame( frame, count ) {

	mouseX = 0, mouseY = 0;
	var timer = frame * 2 * Math.PI / count;
	camera.position.y += ( - mouseY - camera.position.y ) * .05;
	camera.position.x = 1000 * Math.cos( timer );
	camera.position.z = 1000 * Math.sin( timer );

	camera.lookAt( scene.position );

	effect.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
