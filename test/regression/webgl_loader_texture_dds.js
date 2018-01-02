function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 0, 1800 );
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	var time = 2 * Math.PI * frame / count;
    for ( var i = 0; i < meshes.length; i ++ ) {

        var mesh = meshes[ i ];
        mesh.rotation.x = time;
        mesh.rotation.y = time;

    }
	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
