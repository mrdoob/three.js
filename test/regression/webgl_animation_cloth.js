function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );

	var geo = new THREE.ParametricGeometry( clothFunction, cloth.w, cloth.h );
	for ( var i = 0, il = clothGeometry.vertices.length; i < il; i ++ ) {

		clothGeometry.vertices[ i ].copy( geo.vertices[ i ] );

	}

	clothGeometry.verticesNeedUpdate = true;
	clothGeometry.computeFaceNormals();
	clothGeometry.computeVertexNormals();
	cloth = new Cloth( xSegs, ySegs );
	lastTime = undefined;

}

function testRenderFrame( frame, count ) {

	var time = frame * 1000;

	var windStrength = Math.cos( time / 7000 ) * 20 + 40;

	windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) );
	windForce.normalize();
	windForce.multiplyScalar( windStrength );

	for ( var i = 0; i < 16; ++ i ) {

		simulate( time );

	}
	_saved_render();
	testHelperFrameReady( renderer );

}
testHelperRun();
