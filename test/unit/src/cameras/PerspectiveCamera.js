/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "PerspectiveCamera" );

QUnit.test( "updateProjectionMatrix" , function( assert ) {

	var cam = new THREE.PerspectiveCamera( 75, 16 / 9, 0.1, 300.0 );

	// updateProjectionMatrix is called in contructor
	var m = cam.projectionMatrix;

	// perspective projection is given my the 4x4 Matrix
	// 2n/r-l		0			l+r/r-l				 0
	//   0		2n/t-b	t+b/t-b				 0
	//   0			0		-(f+n/f-n)	-(2fn/f-n)
	//   0			0				-1					 0

	// this matrix was calculated by hand via glMatrix.perspective(75, 16 / 9, 0.1, 300.0, pMatrix)
	// to get a reference matrix from plain WebGL
	var reference = new THREE.Matrix4().set(
		0.7330642938613892, 0, 0, 0,
		0, 1.3032253980636597, 0, 0,
		0, 0, -1.000666856765747, -0.2000666856765747,
		0, 0, -1, 0
	);

	assert.ok( reference.equals(m) );
});

QUnit.test( "clone" , function( assert ) {
	var near = 1,
			far = 3,
			bottom = -1,
			top = 1,
			aspect = 16 / 9,
			fov = 90;

	var cam = new THREE.PerspectiveCamera( fov, aspect, near, far );

	var clonedCam = cam.clone();

	assert.ok( cam.fov === clonedCam.fov , "fov is equal" );
	assert.ok( cam.aspect === clonedCam.aspect , "aspect is equal" );
	assert.ok( cam.near === clonedCam.near , "near is equal" );
	assert.ok( cam.far === clonedCam.far , "far is equal" );
	assert.ok( cam.zoom === clonedCam.zoom , "zoom is equal" );
	assert.ok( cam.projectionMatrix.equals(clonedCam.projectionMatrix) , "projectionMatrix is equal" );
});
