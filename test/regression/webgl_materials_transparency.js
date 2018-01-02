function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0.0, 40, 40 * 3.5 );
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

		var object = scene.children[ i ];

		if ( object.geometry instanceof THREE.SphereGeometry ) {

			object.rotation.x = frame;
			object.rotation.y = - frame;

		}

	}

	renderer.render( scene, camera );

	testHelperFrameReady( renderer );

}

testHelperRun();
