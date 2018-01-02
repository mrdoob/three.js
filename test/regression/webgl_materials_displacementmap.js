function testInit() {

	camera.position.set( 0, 0, 1500 );
    var aspect = testHelperGetCameraAspect();

    camera.left = - height * aspect;
    camera.right = height * aspect;
    camera.top = height;
    camera.bottom = - height;

    camera.updateProjectionMatrix();

	testHelperSetSizeAndRatio( renderer );

    r = 0.0
}

function testRenderFrame( frame, count ) {

    pointLight.position.x = 2500 * Math.cos( r );
    pointLight.position.z = 2500 * Math.sin( r );

    r += 2 * Math.PI / count;
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
