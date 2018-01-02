function testInit() {

	camera.aspect = testHelperGetCameraAspect();
	camera.updateProjectionMatrix();
	testHelperSetSizeAndRatio( renderer );

}

function testRenderFrame( frame, count ) {

	renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 ); // to allow for very bright scenes.
	renderer.shadowMap.enabled = params.shadows;
	bulbLight.castShadow = params.shadows;
	if ( params.shadows !== previousShadowMap ) {

		ballMat.needsUpdate = true;
		cubeMat.needsUpdate = true;
		floorMat.needsUpdate = true;
		previousShadowMap = params.shadows;

	}
	bulbLight.power = bulbLuminousPowers[ params.bulbPower ];
	bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow( 0.02, 2.0 ); // convert from intensity to irradiance at bulb surface

	hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ];
	var time = 2 * Math.PI * frame / count;

	bulbLight.position.y = Math.cos( time ) * 0.75 + 1.25;

	renderer.render( scene, camera );
	testHelperFrameReady( renderer );

}

testHelperRun();
