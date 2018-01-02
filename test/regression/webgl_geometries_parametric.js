function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 400, 0 );
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	var timer = frame * 2 * Math.PI / count;

	camera.position.x = Math.cos( timer ) * 800;
	camera.position.z = Math.sin( timer ) * 800;

	camera.lookAt( scene.position );

	scene.traverse( function ( object ) {

		if ( object.isMesh === true ) {

			object.rotation.x = timer * 5;
			object.rotation.y = timer * 2.5;

		}

	} );

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();

