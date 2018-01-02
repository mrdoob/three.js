function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	camera.position.z = 6;
	uniforms1.time.value = 1.0;
	uniforms2.time.value = 1.0;

	for ( var i = 0; i < scene.children.length; i ++ ) {

		var object = scene.children[ i ];

		object.rotation.y = 0;
		object.rotation.x = 0;

	}

}

function testRenderFrame( frame, count ) {

	var delta = 10 / count;

	uniforms1.time.value += delta * 5;
	uniforms2.time.value += delta * 3;

	for ( var i = 0; i < scene.children.length; i ++ ) {

		var object = scene.children[ i ];

		object.rotation.y += delta * 0.5 * ( i % 2 ? 1 : - 1 );
		object.rotation.x += delta * 0.5 * ( i % 2 ? - 1 : 1 );

	}

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
