function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 0, 900 );
	testHelperSetSizeAndRatio( renderer );
	materialHDR.uniforms.exposure.value = 0.125;
	sign = 1, rate = 1;

}

function testRenderFrame( frame, count ) {

	var delta = 5;

	if ( materialHDR.uniforms.exposure.value > 0 || materialHDR.uniforms.exposure.value < 1 ) {

		rate = 0.25;

	} else {

		rate = 1;

	}

	if ( materialHDR.uniforms.exposure.value > 5 || materialHDR.uniforms.exposure.value <= 0 ) {

		sign *= - 1;

	}

	materialHDR.uniforms.exposure.value += sign * rate * delta;

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
