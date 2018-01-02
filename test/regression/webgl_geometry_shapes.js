function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	camera.position.set( 0, 150, 500 );
	testHelperSetSizeAndRatio( renderer );
	group.rotation.y = 0;
	document.removeEventListener( 'mousedown', onDocumentMouseDown, false );
	document.removeEventListener( 'touchstart', onDocumentTouchStart, false );
	document.removeEventListener( 'touchmove', onDocumentTouchMove, false );
	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function testRenderFrame( frame, count ) {

	group.rotation.y += 2 * Math.PI / count;

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
