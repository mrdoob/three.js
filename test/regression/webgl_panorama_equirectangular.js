function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );
	lon = 0;

}

function testRenderFrame( frame, count ) {

	var timer = 16 * Math.PI * frame / count;

	if ( isUserInteracting === false ) {

		lon += timer;

	}

	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );

	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.y = 500 * Math.cos( phi );
	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

	camera.lookAt( camera.target );

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
