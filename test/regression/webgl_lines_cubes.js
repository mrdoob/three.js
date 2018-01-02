function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 0, 700 );
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	mouseX = 0, mouseY = 0;
	camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;

	camera.lookAt( scene.position );

	var time = frame;

	for ( var i = 0; i < scene.children.length; i ++ ) {

		var object = scene.children[ i ];
		if ( object instanceof THREE.Line ) object.rotation.y = time * ( i % 2 ? 1 : - 1 );

	}

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
