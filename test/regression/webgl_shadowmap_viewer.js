function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	initShadowMapViewers();
	torusKnot.rotation.set( 0, 0, 0 );
	cube.rotation.set( 0, 0, 0 );

}

function testRenderFrame( frame, count ) {

	var delta = 2 * Math.PI * frame / count;

	renderScene();
	renderShadowMapViewers();

	torusKnot.rotation.x += 0.25 * delta;
	torusKnot.rotation.y += 2 * delta;
	torusKnot.rotation.z += 1 * delta;

	cube.rotation.x += 0.25 * delta;
	cube.rotation.y += 2 * delta;
	cube.rotation.z += 1 * delta;

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
