function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	camera.position.set( 0, 75, 160 );
	sphereGroup.rotation.y = 0;

}

function testRenderFrame( frame, count ) {

	var timer = 10 * 2 * Math.PI * frame / count;

	sphereGroup.rotation.y -= 0.002;

	smallSphere.position.set(
		Math.cos( timer * 0.1 ) * 30,
		Math.abs( Math.cos( timer * 0.2 ) ) * 20 + 5,
		Math.sin( timer * 0.1 ) * 30
	);
	smallSphere.rotation.y = ( Math.PI / 2 ) - timer * 0.1;
	smallSphere.rotation.z = timer * 0.8;

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
