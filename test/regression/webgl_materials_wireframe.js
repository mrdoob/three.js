function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	camera.position.set( 0, 0, 800 );
	for ( var i = 0; i < scene.children.length; i ++ ) {

		var object = scene.children[ i ];
		object.rotation.x = 0;
		object.rotation.y = 0;

	}

}

function testRenderFrame( frame, count ) {

	var timer = 2 * Math.PI * frame / count;

	for ( var i = 0; i < scene.children.length; i ++ ) {

		var object = scene.children[ i ];
		object.rotation.x += 5 * timer;
		object.rotation.y += timer;

	}

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
