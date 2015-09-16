/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "PerspectiveCamera" );

test( "updateProjectionMatrix", function() {
	var near = 1,
			far = 3,
			bottom = -1,
			top = 1,
			aspect = 16 / 9,
			left = -top * aspect,
			right = -bottom * aspect,
			fov = 90;

	var cam = new THREE.PerspectiveCamera( fov, aspect, near, far );

	// updateProjectionMatrix is called in contructor
	var m = cam.projectionMatrix.elements;

	// perspective projection is given my the 4x4 Matrix
	// 2n/r-l		0			l+r/r-l				 0
	//   0		2n/t-b	t+b/t-b				 0
	//   0			0		-(f+n/f-n)	-(2fn/f-n)
	//   0			0				0						 1

	ok( m[0] === ( 2 * near ) / ( right - left ), "m[0,0] === 2n/r-l" );
	ok( m[5] === ( 2 * near ) / ( top - bottom ), "m[1,1] === 2n/r-l" );
	ok( m[8] === ( right + left ) / ( right - left ), "m[2,0] === 2n/r-l" );
	ok( m[9] === ( top + bottom ) / ( top - bottom ), "m[2,1] === 2n/r-l" );
	ok( m[10] === - ( far + near ) / ( far - near ), "m[2,2] === 2n/r-l" );
	ok( m[14] === - ( 2 * near * far ) / ( far - near ), "m[3,2] === 2n/r-l" );
});

test( "clone", function() {
	var near = 1,
			far = 3,
			bottom = -1,
			top = 1,
			aspect = 16 / 9,
			fov = 90;

	var cam = new THREE.PerspectiveCamera( fov, aspect, near, far );

	var clonedCam = cam.clone();

	ok( cam.fov === clonedCam.fov , "fov is equal" );
	ok( cam.aspect === clonedCam.aspect , "aspect is equal" );
	ok( cam.near === clonedCam.near , "near is equal" );
	ok( cam.far === clonedCam.far , "far is equal" );
	ok( cam.zoom === clonedCam.zoom , "zoom is equal" );
	ok( cam.projectionMatrix.equals(clonedCam.projectionMatrix) , "projectionMatrix is equal" );
});
