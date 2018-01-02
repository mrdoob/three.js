function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	camera.position.set( - 10, 0, 15 );
	refractor.material.uniforms.time.value = 0;

}

function testRenderFrame( frame, count ) {

	refractor.material.uniforms.time.value += 1000000;
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
