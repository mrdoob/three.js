function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 0, 1800 );
	testHelperSetSizeAndRatio( renderer );
	mesh.rotation.x = 0;
	mesh.rotation.y = 0;
	mesh2.rotation.x = 0;
	mesh2.rotation.y = 0;

}

function testRenderFrame( frame, count ) {

	mouseX = 0, mouseY = 0;
	camera.position.x += ( mouseX - camera.position.x ) * 0.5;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.5;

	camera.lookAt( scene.position );

	if ( mesh ) {

		mesh.rotation.x += 0.1;
		mesh.rotation.y += 0.1;

	}

	if ( mesh2 ) {

		mesh2.rotation.x += 0.1;
		mesh2.rotation.y += 0.1;

	}

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();


