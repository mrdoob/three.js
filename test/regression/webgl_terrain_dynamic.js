function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );

	uniformsNoise[ 'time' ].value = 1.0;
	uniformsNoise[ 'offset' ].value.x = 0.0;
	uniformsNoise[ 'offset' ].value.y = 0.0;

}

function testRenderFrame( frame, count ) {

	var timer = 16 * Math.PI * frame / count;

	var delta = 1000 / count;

	if ( terrain.visible ) {

		var time = frame / count;

		var fLow = 0.1, fHigh = 0.8;

		lightVal = THREE.Math.clamp( lightVal + 0.5 * delta * lightDir, fLow, fHigh );

		var valNorm = ( lightVal - fLow ) / ( fHigh - fLow );

		scene.background.setHSL( 0.1, 0.5, lightVal );
		scene.fog.color.setHSL( 0.1, 0.5, lightVal );

		directionalLight.intensity = THREE.Math.mapLinear( valNorm, 0, 1, 0.1, 1.15 );
		pointLight.intensity = THREE.Math.mapLinear( valNorm, 0, 1, 0.9, 1.5 );

		uniformsTerrain[ 'uNormalScale' ].value = THREE.Math.mapLinear( valNorm, 0, 1, 0.6, 3.5 );

		if ( updateNoise ) {

			animDelta = THREE.Math.clamp( animDelta + 0.00075 * animDeltaDir, 0, 0.05 );
			uniformsNoise[ 'time' ].value += delta * animDelta;

			uniformsNoise[ 'offset' ].value.x += delta * 0.05;

			uniformsTerrain[ 'uOffset' ].value.x = 4 * uniformsNoise[ 'offset' ].value.x;

			quadTarget.material = mlib[ 'heightmap' ];
			renderer.render( sceneRenderTarget, cameraOrtho, heightMap, true );

			quadTarget.material = mlib[ 'normal' ];
			renderer.render( sceneRenderTarget, cameraOrtho, normalMap, true );

		}

		renderer.render( scene, camera );

	}

	testHelperFrameReady( renderer );

}

testHelperRun();
