function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	camera.position.set( 0, 0, - 4000 );

}

function testRenderFrame( frame, count ) {

	var timer = 2 * Math.PI * frame / count;
	mouseX = 0, mouseY = 0;
	camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y += ( - mouseY - camera.position.y ) * .05;

	camera.lookAt( scene.position );

	pointLight.position.x = 1500 * Math.cos( timer );
	pointLight.position.z = 1500 * Math.sin( timer );

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
